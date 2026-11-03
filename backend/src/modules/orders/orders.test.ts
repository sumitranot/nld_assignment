import request from 'supertest';
import { app } from '../../app';
import { sequelize, Product, Order } from '../../db/models';
import { computeTotalAmount } from '../../utils/money';

describe('Orders API Integration & Concurrency Tests', () => {
  let adminToken: string;
  let createToken: string;
  let viewToken: string;

  beforeAll(async () => {
    await sequelize.authenticate();

    // Login demo users seeded in Phase 1
    const adminLogin = await request(app)
      .post('/auth/login')
      .send({ email: 'admin@example.com', password: 'Admin@123' });
    adminToken = adminLogin.body.token as string;

    const createLogin = await request(app)
      .post('/auth/login')
      .send({ email: 'create@example.com', password: 'User@123' });
    createToken = createLogin.body.token as string;

    const viewLogin = await request(app)
      .post('/auth/login')
      .send({ email: 'view@example.com', password: 'User@123' });
    viewToken = viewLogin.body.token as string;
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('POST /orders (Order Creation & Transactions)', () => {
    it('creates an order, deducts stock, and calculates total for user with CREATE access', async () => {
      // Find a product with sufficient stock
      const product = await Product.findOne({ where: { sku: 'SKU-BOX-SM-001' } });
      expect(product).not.toBeNull();
      const initialStock = product!.stockQty;
      const expectedTotal = computeTotalAmount([{ unitPrice: product!.price, quantity: 2 }]);

      const res = await request(app)
        .post('/orders')
        .set('Authorization', `Bearer ${createToken}`)
        .send({
          items: [{ sku: 'SKU-BOX-SM-001', qty: 2 }],
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.orderNumber).toMatch(/^ORD-\d{8}-[A-F0-9]{6}$/);
      expect(res.body.status).toBe('PENDING');
      expect(res.body.totalAmount).toBe(expectedTotal);
      expect(res.body.items).toHaveLength(1);
      expect(res.body.items[0].quantity).toBe(2);
      expect(res.body.items[0].unitPrice).toBe(product!.price);

      // Verify DB stock was decremented
      await product!.reload();
      expect(product!.stockQty).toBe(initialStock - 2);
    });

    it('merges duplicate SKUs in payload and deducts aggregate quantity', async () => {
      const product = await Product.findOne({ where: { sku: 'SKU-BOX-MD-002' } });
      const initialStock = product!.stockQty;

      const res = await request(app)
        .post('/orders')
        .set('Authorization', `Bearer ${createToken}`)
        .send({
          items: [
            { sku: 'SKU-BOX-MD-002', qty: 1 },
            { sku: 'SKU-BOX-MD-002', qty: 2 },
          ],
        });

      expect(res.status).toBe(201);
      expect(res.body.items).toHaveLength(1);
      expect(res.body.items[0].quantity).toBe(3);

      await product!.reload();
      expect(product!.stockQty).toBe(initialStock - 3);
    });

    it('rolls back entire transaction if any item has missing SKU', async () => {
      const product = await Product.findOne({ where: { sku: 'SKU-BOX-LG-003' } });
      const initialStock = product!.stockQty;

      const res = await request(app)
        .post('/orders')
        .set('Authorization', `Bearer ${createToken}`)
        .send({
          items: [
            { sku: 'SKU-BOX-LG-003', qty: 1 },
            { sku: 'NON_EXISTENT_SKU_XYZ', qty: 1 },
          ],
        });

      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('NOT_FOUND');
      expect(res.body.error.details.missingSkus).toContain('NON_EXISTENT_SKU_XYZ');

      // Stock must be intact due to transaction rollback
      await product!.reload();
      expect(product!.stockQty).toBe(initialStock);
    });

    it('rolls back transaction with 409 Conflict if stock is insufficient', async () => {
      const product = await Product.findOne({ where: { sku: 'SKU-BOX-XL-004' } });
      const initialStock = product!.stockQty;

      const res = await request(app)
        .post('/orders')
        .set('Authorization', `Bearer ${createToken}`)
        .send({
          items: [{ sku: 'SKU-BOX-XL-004', qty: initialStock + 10 }],
        });

      expect(res.status).toBe(409);
      expect(res.body.error.code).toBe('CONFLICT');
      expect(res.body.error.details.insufficientItems).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            sku: 'SKU-BOX-XL-004',
            requested: initialStock + 10,
            available: initialStock,
          }),
        ]),
      );

      // Verify stock was not touched
      await product!.reload();
      expect(product!.stockQty).toBe(initialStock);
    });

    it('forbids USER with VIEW access from creating orders (403)', async () => {
      const res = await request(app)
        .post('/orders')
        .set('Authorization', `Bearer ${viewToken}`)
        .send({
          items: [{ sku: 'SKU-BOX-SM-001', qty: 1 }],
        });

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('FORBIDDEN');
    });

    it('allows ADMIN to bypass access checks and create orders', async () => {
      const res = await request(app)
        .post('/orders')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          items: [{ sku: 'SKU-BOX-SM-001', qty: 1 }],
        });

      expect(res.status).toBe(201);
    });
  });

  describe('GET /orders (Listing, Filtering & Item Count Aggregation)', () => {
    it('returns orders for user with SQL-aggregated itemCount and lineCount', async () => {
      const res = await request(app)
        .get('/orders')
        .set('Authorization', `Bearer ${createToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);

      const firstOrder = res.body.data[0];
      expect(firstOrder).toHaveProperty('itemCount');
      expect(firstOrder).toHaveProperty('lineCount');
      expect(typeof firstOrder.itemCount).toBe('number');
      expect(firstOrder.itemCount).toBeGreaterThan(0);
      expect(typeof firstOrder.lineCount).toBe('number');
    });

    it('USER only sees their own orders and cannot see other users orders', async () => {
      const res = await request(app)
        .get('/orders')
        .set('Authorization', `Bearer ${viewToken}`);

      expect(res.status).toBe(200);
      // View user has created 0 orders
      expect(res.body.data.length).toBe(0);
    });

    it('filters orders by status', async () => {
      const res = await request(app)
        .get('/orders?status=PENDING')
        .set('Authorization', `Bearer ${createToken}`);

      expect(res.status).toBe(200);
      for (const order of res.body.data) {
        expect(order.status).toBe('PENDING');
      }
    });

    it('filters orders by date range', async () => {
      const today = new Date().toISOString().slice(0, 10);
      const res = await request(app)
        .get(`/orders?from=${today}&to=${today}`)
        .set('Authorization', `Bearer ${createToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThan(0);
    });
  });

  describe('POST /orders/:id/cancel & PATCH /orders/:id/confirm', () => {
    let orderToCancelId: number;
    let orderProduct: Product;
    let preOrderStock: number;

    beforeEach(async () => {
      orderProduct = (await Product.findOne({ where: { sku: 'SKU-TAPE-CLR-005' } }))!;
      preOrderStock = orderProduct.stockQty;

      const orderRes = await request(app)
        .post('/orders')
        .set('Authorization', `Bearer ${createToken}`)
        .send({
          items: [{ sku: 'SKU-TAPE-CLR-005', qty: 5 }],
        });

      orderToCancelId = orderRes.body.id as number;
    });

    it('cancelling a PENDING order restores product stock in a transaction', async () => {
      await orderProduct.reload();
      expect(orderProduct.stockQty).toBe(preOrderStock - 5);

      const cancelRes = await request(app)
        .post(`/orders/${orderToCancelId}/cancel`)
        .set('Authorization', `Bearer ${createToken}`);

      expect(cancelRes.status).toBe(200);
      expect(cancelRes.body.status).toBe('CANCELLED');

      // Verify stock was restored
      await orderProduct.reload();
      expect(orderProduct.stockQty).toBe(preOrderStock);
    });

    it('double-cancel returns 409 Conflict', async () => {
      // First cancel
      await request(app)
        .post(`/orders/${orderToCancelId}/cancel`)
        .set('Authorization', `Bearer ${createToken}`);

      // Second cancel attempt
      const res = await request(app)
        .post(`/orders/${orderToCancelId}/cancel`)
        .set('Authorization', `Bearer ${createToken}`);

      expect(res.status).toBe(409);
      expect(res.body.error.code).toBe('CONFLICT');
      expect(res.body.error.message).toContain('already been cancelled');
    });

    it('USER cannot cancel another users order (returns 404 to avoid leaking existence)', async () => {
      // Register another user with CREATE access
      const otherUserEmail = `other_${Date.now()}@example.com`;
      const regRes = await request(app)
        .post('/auth/register')
        .send({
          email: otherUserEmail,
          password: 'Password@123',
          role: 'USER',
          access: 'CREATE',
        });
      const otherToken = regRes.body.token as string;

      const res = await request(app)
        .post(`/orders/${orderToCancelId}/cancel`)
        .set('Authorization', `Bearer ${otherToken}`);

      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });

    it('ADMIN can confirm a PENDING order', async () => {
      const confirmRes = await request(app)
        .patch(`/orders/${orderToCancelId}/confirm`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(confirmRes.status).toBe(200);
      expect(confirmRes.body.status).toBe('CONFIRMED');

      // Confirming an already confirmed order yields 409 Conflict
      const secondConfirm = await request(app)
        .patch(`/orders/${orderToCancelId}/confirm`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(secondConfirm.status).toBe(409);
    });

    it('cancelling a CONFIRMED order restores stock', async () => {
      // Confirm the order first
      await request(app)
        .patch(`/orders/${orderToCancelId}/confirm`)
        .set('Authorization', `Bearer ${adminToken}`);

      const cancelRes = await request(app)
        .post(`/orders/${orderToCancelId}/cancel`)
        .set('Authorization', `Bearer ${createToken}`);

      expect(cancelRes.status).toBe(200);
      expect(cancelRes.body.status).toBe('CANCELLED');

      await orderProduct.reload();
      expect(orderProduct.stockQty).toBe(preOrderStock);
    });
  });

  describe('CONCURRENCY STRESS TEST (Zero Negative Stock Guarantee)', () => {
    it('handles 20 parallel orders competing for 5 items: exactly 5 succeed, 15 fail, final stock is 0', async () => {
      const concurrencySku = `SKU-RACE-${Date.now()}`;
      const initialStock = 5;

      // 1. Create a fresh test product with exactly 5 in stock
      const product = await Product.create({
        name: 'High-Demand Flash Sale Item',
        sku: concurrencySku,
        stockQty: initialStock,
        price: '10.00',
      });

      // 2. Fire 20 parallel order requests for 1 item each using Promise.all
      const parallelRequests = Array.from({ length: 20 }, () =>
        request(app)
          .post('/orders')
          .set('Authorization', `Bearer ${createToken}`)
          .send({
            items: [{ sku: concurrencySku, qty: 1 }],
          }),
      );

      const results = await Promise.all(parallelRequests);

      // 3. Tally outcomes
      const successfulOrders = results.filter((r) => r.status === 201);
      const rejectedOrders = results.filter((r) => r.status === 409);

      expect(successfulOrders).toHaveLength(5);
      expect(rejectedOrders).toHaveLength(15);

      // All 15 rejections should specify insufficient stock
      for (const rej of rejectedOrders) {
        expect(rej.body.error.code).toBe('CONFLICT');
      }

      // 4. Verify DB state: final stock must be exactly 0, never negative
      await product.reload();
      expect(product.stockQty).toBe(0);

      // 5. Verify database order counts
      const ordersInDb = await Order.findAll({
        include: [
          {
            model: sequelize.models.OrderItem!,
            as: 'items',
            where: { productId: product.id },
          },
        ],
      });
      expect(ordersInDb).toHaveLength(5);
    });
  });
});
