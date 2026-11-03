import crypto from 'crypto';
import { Op, WhereOptions, UniqueConstraintError } from 'sequelize';
import { sequelize, Order, OrderItem, Product, User } from '../../db/models';
import { ConflictError, NotFoundError } from '../../utils/AppError';
import { computeTotalAmount } from '../../utils/money';
import { parsePagination, buildPaginationMeta, PaginatedResult } from '../../utils/pagination';
import { CreateOrderDTO, OrderListItemDTO, OrderQueryFilters } from './orders.dto';

const generateOrderNumber = (): string => {
  const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomPart = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `ORD-${datePart}-${randomPart}`;
};

export class OrdersService {
  /**
   * Creates an order with deterministic pessimistic row locking and atomic stock deduction.
   * Lock order: products ordered by `id ASC` to prevent concurrent deadlocks.
   */
  static async createOrder(userId: number, input: CreateOrderDTO): Promise<Order> {
    // 1. Merge duplicate SKUs in payload (sum quantities)
    const mergedMap = new Map<string, number>();
    for (const item of input.items) {
      const existing = mergedMap.get(item.sku) ?? 0;
      mergedMap.set(item.sku, existing + item.qty);
    }
    const mergedItems = Array.from(mergedMap.entries()).map(([sku, qty]) => ({ sku, qty }));
    const requestedSkus = mergedItems.map((i) => i.sku);

    return await sequelize.transaction(async (t) => {
      // 2. Fetch all matching products with row-level pessimistic locks in consistent ID order
      const products = await Product.findAll({
        where: { sku: { [Op.in]: requestedSkus } },
        order: [['id', 'ASC']],
        transaction: t,
        lock: t.LOCK.UPDATE,
      });

      // 3. Validate missing SKUs
      const foundSkus = new Set(products.map((p) => p.sku));
      const missingSkus = requestedSkus.filter((sku) => !foundSkus.has(sku));
      if (missingSkus.length > 0) {
        throw new NotFoundError(
          `The following product SKUs do not exist: ${missingSkus.join(', ')}`,
          { missingSkus },
        );
      }

      // 4. Validate stock availability across all requested items
      const productMap = new Map(products.map((p) => [p.sku, p]));
      const insufficientStock: Array<{ sku: string; requested: number; available: number }> = [];

      for (const item of mergedItems) {
        const product = productMap.get(item.sku)!;
        if (product.stockQty < item.qty) {
          insufficientStock.push({
            sku: item.sku,
            requested: item.qty,
            available: product.stockQty,
          });
        }
      }

      if (insufficientStock.length > 0) {
        throw new ConflictError('Insufficient stock for one or more requested products', {
          insufficientItems: insufficientStock,
        });
      }

      // 5. Decrement stock atomically and prepare order item snapshots
      const itemsToCreate: Array<{
        productId: number;
        quantity: number;
        unitPrice: string;
      }> = [];

      for (const item of mergedItems) {
        const product = productMap.get(item.sku)!;
        product.stockQty -= item.qty;
        await product.save({ transaction: t });

        itemsToCreate.push({
          productId: product.id,
          quantity: item.qty,
          unitPrice: product.price, // Snapshot at order creation
        });
      }

      // 6. Compute grand total using zero-drift integer cents
      const totalAmount = computeTotalAmount(
        itemsToCreate.map((i) => ({ unitPrice: i.unitPrice, quantity: i.quantity })),
      );

      // 7. Create Order with collision retry logic
      let order: Order | null = null;
      let attempts = 0;
      const MAX_RETRIES = 5;

      while (!order && attempts < MAX_RETRIES) {
        attempts++;
        const orderNumber = generateOrderNumber();
        try {
          order = await Order.create(
            {
              userId,
              orderNumber,
              status: 'PENDING',
              totalAmount,
            },
            { transaction: t },
          );
        } catch (err) {
          if (err instanceof UniqueConstraintError && attempts < MAX_RETRIES) {
            continue;
          }
          throw err;
        }
      }

      if (!order) {
        throw new Error('Failed to generate a unique order number');
      }

      // 8. Bulk insert order line items
      const orderItems = itemsToCreate.map((item) => ({
        ...item,
        orderId: order.id,
      }));
      await OrderItem.bulkCreate(orderItems, { transaction: t });

      // 9. Reload order with associated items and product details
      const fullOrder = await Order.findByPk(order.id, {
        include: [
          {
            model: OrderItem,
            as: 'items',
            include: [{ model: Product, as: 'product' }],
          },
        ],
        transaction: t,
      });

      if (!fullOrder) {
        throw new Error('Failed to retrieve created order');
      }

      return fullOrder;
    });
  }

  /**
   * Lists orders with filters and SQL-aggregated itemCount/lineCount (no N+1).
   */
  static async listOrders(
    currentUser: User,
    filters: OrderQueryFilters,
  ): Promise<PaginatedResult<OrderListItemDTO>> {
    const { page, limit, offset } = parsePagination(filters);

    const where: WhereOptions = {};

    // RBAC: USER only sees own orders; ADMIN sees all and can filter by userId
    if (currentUser.role === 'USER') {
      where.user_id = currentUser.id;
    } else if (filters.userId) {
      where.user_id = filters.userId;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.from || filters.to) {
      const dateRange: { [Op.gte]?: Date; [Op.lte]?: Date } = {};
      if (filters.from) {
        dateRange[Op.gte] = new Date(filters.from);
      }
      if (filters.to) {
        const toDate = new Date(filters.to);
        if (filters.to.length === 10) {
          toDate.setUTCHours(23, 59, 59, 999);
        }
        dateRange[Op.lte] = toDate;
      }
      where.created_at = dateRange;
    }

    const { count, rows } = await Order.findAndCountAll({
      where,
      limit,
      offset,
      order: [['created_at', 'DESC']],
      attributes: {
        include: [
          [
            sequelize.literal(`(
              SELECT COALESCE(SUM(oi.quantity), 0)::INTEGER
              FROM order_items AS oi
              WHERE oi.order_id = "Order"."id"
            )`),
            'itemCount',
          ],
          [
            sequelize.literal(`(
              SELECT COUNT(*)::INTEGER
              FROM order_items AS oi
              WHERE oi.order_id = "Order"."id"
            )`),
            'lineCount',
          ],
        ],
      },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'email'],
        },
      ],
    });

    const formattedData: OrderListItemDTO[] = rows.map((order) => {
      const plain = order.get({ plain: true });
      const itemCount = order.get('itemCount');
      const lineCount = order.get('lineCount');
      const orderUser = order.user;
      return {
        id: plain.id,
        orderNumber: plain.orderNumber,
        status: plain.status,
        totalAmount: plain.totalAmount,
        createdAt: plain.createdAt ?? new Date(),
        itemCount: typeof itemCount === 'number' ? itemCount : Number(itemCount ?? 0),
        lineCount: typeof lineCount === 'number' ? lineCount : Number(lineCount ?? 0),
        userId: plain.userId,
        user: orderUser ? { id: orderUser.id, email: orderUser.email } : undefined,
      };
    });

    return {
      data: formattedData,
      meta: buildPaginationMeta(count, page, limit),
    };
  }

  /**
   * Retrieves single order by ID with authorization check.
   */
  static async getOrderById(currentUser: User, orderId: number): Promise<Order> {
    const order = await Order.findByPk(orderId, {
      include: [
        {
          model: OrderItem,
          as: 'items',
          include: [{ model: Product, as: 'product' }],
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'email'],
        },
      ],
    });

    if (!order) {
      throw new NotFoundError(`Order with ID ${orderId} not found`);
    }

    // Security design decision: return 404 rather than 403 to avoid leaking order existence
    if (currentUser.role === 'USER' && order.userId !== currentUser.id) {
      throw new NotFoundError(`Order with ID ${orderId} not found`);
    }

    return order;
  }

  /**
   * Cancels order and restores product stock in a managed transaction.
   * Double-cancel safe (returns 409 on second cancel).
   */
  static async cancelOrder(currentUser: User, orderId: number): Promise<Order> {
    return await sequelize.transaction(async (t) => {
      // 1. Lock the order row
      const order = await Order.findByPk(orderId, {
        transaction: t,
        lock: t.LOCK.UPDATE,
      });

      if (!order) {
        throw new NotFoundError(`Order with ID ${orderId} not found`);
      }

      // Security design decision: return 404 rather than 403 to avoid leaking existence
      if (currentUser.role === 'USER' && order.userId !== currentUser.id) {
        throw new NotFoundError(`Order with ID ${orderId} not found`);
      }

      // 2. Validate status
      if (order.status === 'CANCELLED') {
        throw new ConflictError('Order has already been cancelled');
      }

      if (order.status !== 'PENDING' && order.status !== 'CONFIRMED') {
        const currentStatus = String(order.status);
        throw new ConflictError(
          `Cannot cancel order with status '${currentStatus}'. Only PENDING or CONFIRMED orders may be cancelled.`,
        );
      }

      // 3. Fetch items and lock products ordered by ID ASC to avoid deadlocks
      const items = await OrderItem.findAll({
        where: { orderId: order.id },
        transaction: t,
      });

      const productIds = Array.from(new Set(items.map((i) => i.productId)));
      const products = await Product.findAll({
        where: { id: { [Op.in]: productIds } },
        order: [['id', 'ASC']],
        transaction: t,
        lock: t.LOCK.UPDATE,
      });

      const productMap = new Map(products.map((p) => [p.id, p]));

      // 4. Restore stock
      for (const item of items) {
        const product = productMap.get(item.productId);
        if (product) {
          product.stockQty += item.quantity;
          await product.save({ transaction: t });
        }
      }

      // 5. Update order status
      order.status = 'CANCELLED';
      await order.save({ transaction: t });

      return order;
    });
  }

  /**
   * Admin-only endpoint to transition PENDING -> CONFIRMED.
   */
  static async confirmOrder(orderId: number): Promise<Order> {
    return await sequelize.transaction(async (t) => {
      const order = await Order.findByPk(orderId, {
        transaction: t,
        lock: t.LOCK.UPDATE,
      });

      if (!order) {
        throw new NotFoundError(`Order with ID ${orderId} not found`);
      }

      if (order.status !== 'PENDING') {
        throw new ConflictError(
          `Cannot confirm order with status '${order.status}'. Only PENDING orders can be confirmed.`,
        );
      }

      order.status = 'CONFIRMED';
      await order.save({ transaction: t });

      return order;
    });
  }
}
