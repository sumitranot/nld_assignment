"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrdersService = void 0;
const crypto_1 = __importDefault(require("crypto"));
const sequelize_1 = require("sequelize");
const models_1 = require("../../db/models");
const AppError_1 = require("../../utils/AppError");
const money_1 = require("../../utils/money");
const pagination_1 = require("../../utils/pagination");
const generateOrderNumber = () => {
    const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomPart = crypto_1.default.randomBytes(3).toString('hex').toUpperCase();
    return `ORD-${datePart}-${randomPart}`;
};
class OrdersService {
    /**
     * Creates an order with deterministic pessimistic row locking and atomic stock deduction.
     * Lock order: products ordered by `id ASC` to prevent concurrent deadlocks.
     */
    static async createOrder(userId, input) {
        // 1. Merge duplicate SKUs in payload (sum quantities)
        const mergedMap = new Map();
        for (const item of input.items) {
            const existing = mergedMap.get(item.sku) ?? 0;
            mergedMap.set(item.sku, existing + item.qty);
        }
        const mergedItems = Array.from(mergedMap.entries()).map(([sku, qty]) => ({ sku, qty }));
        const requestedSkus = mergedItems.map((i) => i.sku);
        return await models_1.sequelize.transaction(async (t) => {
            // 2. Fetch all matching products with row-level pessimistic locks in consistent ID order
            const products = await models_1.Product.findAll({
                where: { sku: { [sequelize_1.Op.in]: requestedSkus } },
                order: [['id', 'ASC']],
                transaction: t,
                lock: t.LOCK.UPDATE,
            });
            // 3. Validate missing SKUs
            const foundSkus = new Set(products.map((p) => p.sku));
            const missingSkus = requestedSkus.filter((sku) => !foundSkus.has(sku));
            if (missingSkus.length > 0) {
                throw new AppError_1.NotFoundError(`The following product SKUs do not exist: ${missingSkus.join(', ')}`, { missingSkus });
            }
            // 4. Validate stock availability across all requested items
            const productMap = new Map(products.map((p) => [p.sku, p]));
            const insufficientStock = [];
            for (const item of mergedItems) {
                const product = productMap.get(item.sku);
                if (product.stockQty < item.qty) {
                    insufficientStock.push({
                        sku: item.sku,
                        requested: item.qty,
                        available: product.stockQty,
                    });
                }
            }
            if (insufficientStock.length > 0) {
                throw new AppError_1.ConflictError('Insufficient stock for one or more requested products', {
                    insufficientItems: insufficientStock,
                });
            }
            // 5. Decrement stock atomically and prepare order item snapshots
            const itemsToCreate = [];
            for (const item of mergedItems) {
                const product = productMap.get(item.sku);
                product.stockQty -= item.qty;
                await product.save({ transaction: t });
                itemsToCreate.push({
                    productId: product.id,
                    quantity: item.qty,
                    unitPrice: product.price, // Snapshot at order creation
                });
            }
            // 6. Compute grand total using zero-drift integer cents
            const totalAmount = (0, money_1.computeTotalAmount)(itemsToCreate.map((i) => ({ unitPrice: i.unitPrice, quantity: i.quantity })));
            // 7. Create Order with collision retry logic
            let order = null;
            let attempts = 0;
            const MAX_RETRIES = 5;
            while (!order && attempts < MAX_RETRIES) {
                attempts++;
                const orderNumber = generateOrderNumber();
                try {
                    order = await models_1.Order.create({
                        userId,
                        orderNumber,
                        status: 'PENDING',
                        totalAmount,
                    }, { transaction: t });
                }
                catch (err) {
                    if (err instanceof sequelize_1.UniqueConstraintError && attempts < MAX_RETRIES) {
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
            await models_1.OrderItem.bulkCreate(orderItems, { transaction: t });
            // 9. Reload order with associated items and product details
            const fullOrder = await models_1.Order.findByPk(order.id, {
                include: [
                    {
                        model: models_1.OrderItem,
                        as: 'items',
                        include: [{ model: models_1.Product, as: 'product' }],
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
    static async listOrders(currentUser, filters) {
        const { page, limit, offset } = (0, pagination_1.parsePagination)(filters);
        const where = {};
        // RBAC: USER only sees own orders; ADMIN sees all and can filter by userId
        if (currentUser.role === 'USER') {
            where.user_id = currentUser.id;
        }
        else if (filters.userId) {
            where.user_id = filters.userId;
        }
        if (filters.status) {
            where.status = filters.status;
        }
        if (filters.from || filters.to) {
            const dateRange = {};
            if (filters.from) {
                dateRange[sequelize_1.Op.gte] = new Date(filters.from);
            }
            if (filters.to) {
                const toDate = new Date(filters.to);
                if (filters.to.length === 10) {
                    toDate.setUTCHours(23, 59, 59, 999);
                }
                dateRange[sequelize_1.Op.lte] = toDate;
            }
            where.created_at = dateRange;
        }
        const { count, rows } = await models_1.Order.findAndCountAll({
            where,
            limit,
            offset,
            order: [['created_at', 'DESC']],
            attributes: {
                include: [
                    [
                        models_1.sequelize.literal(`(
              SELECT COALESCE(SUM(oi.quantity), 0)::INTEGER
              FROM order_items AS oi
              WHERE oi.order_id = "Order"."id"
            )`),
                        'itemCount',
                    ],
                    [
                        models_1.sequelize.literal(`(
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
                    model: models_1.User,
                    as: 'user',
                    attributes: ['id', 'email'],
                },
            ],
        });
        const formattedData = rows.map((order) => {
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
            meta: (0, pagination_1.buildPaginationMeta)(count, page, limit),
        };
    }
    /**
     * Retrieves single order by ID with authorization check.
     */
    static async getOrderById(currentUser, orderId) {
        const order = await models_1.Order.findByPk(orderId, {
            include: [
                {
                    model: models_1.OrderItem,
                    as: 'items',
                    include: [{ model: models_1.Product, as: 'product' }],
                },
                {
                    model: models_1.User,
                    as: 'user',
                    attributes: ['id', 'email'],
                },
            ],
        });
        if (!order) {
            throw new AppError_1.NotFoundError(`Order with ID ${orderId} not found`);
        }
        // Security design decision: return 404 rather than 403 to avoid leaking order existence
        if (currentUser.role === 'USER' && order.userId !== currentUser.id) {
            throw new AppError_1.NotFoundError(`Order with ID ${orderId} not found`);
        }
        return order;
    }
    /**
     * Cancels order and restores product stock in a managed transaction.
     * Double-cancel safe (returns 409 on second cancel).
     */
    static async cancelOrder(currentUser, orderId) {
        return await models_1.sequelize.transaction(async (t) => {
            // 1. Lock the order row
            const order = await models_1.Order.findByPk(orderId, {
                transaction: t,
                lock: t.LOCK.UPDATE,
            });
            if (!order) {
                throw new AppError_1.NotFoundError(`Order with ID ${orderId} not found`);
            }
            // Security design decision: return 404 rather than 403 to avoid leaking existence
            if (currentUser.role === 'USER' && order.userId !== currentUser.id) {
                throw new AppError_1.NotFoundError(`Order with ID ${orderId} not found`);
            }
            // 2. Validate status
            if (order.status === 'CANCELLED') {
                throw new AppError_1.ConflictError('Order has already been cancelled');
            }
            if (order.status !== 'PENDING' && order.status !== 'CONFIRMED') {
                const currentStatus = String(order.status);
                throw new AppError_1.ConflictError(`Cannot cancel order with status '${currentStatus}'. Only PENDING or CONFIRMED orders may be cancelled.`);
            }
            // 3. Fetch items and lock products ordered by ID ASC to avoid deadlocks
            const items = await models_1.OrderItem.findAll({
                where: { orderId: order.id },
                transaction: t,
            });
            const productIds = Array.from(new Set(items.map((i) => i.productId)));
            const products = await models_1.Product.findAll({
                where: { id: { [sequelize_1.Op.in]: productIds } },
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
    static async confirmOrder(orderId) {
        return await models_1.sequelize.transaction(async (t) => {
            const order = await models_1.Order.findByPk(orderId, {
                transaction: t,
                lock: t.LOCK.UPDATE,
            });
            if (!order) {
                throw new AppError_1.NotFoundError(`Order with ID ${orderId} not found`);
            }
            if (order.status !== 'PENDING') {
                throw new AppError_1.ConflictError(`Cannot confirm order with status '${order.status}'. Only PENDING orders can be confirmed.`);
            }
            order.status = 'CONFIRMED';
            await order.save({ transaction: t });
            return order;
        });
    }
}
exports.OrdersService = OrdersService;
//# sourceMappingURL=orders.service.js.map