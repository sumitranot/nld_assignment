import request from 'supertest';
import { app } from '../../app';
import { sequelize } from '../../db/models';

describe('Products API Integration Tests', () => {
  let adminToken: string;
  let userToken: string;

  beforeAll(async () => {
    await sequelize.authenticate();

    // Acquire tokens for admin and regular user
    const adminLogin = await request(app)
      .post('/auth/login')
      .send({ email: 'admin@example.com', password: 'Admin@123' });
    adminToken = adminLogin.body.token as string;

    const userLogin = await request(app)
      .post('/auth/login')
      .send({ email: 'view@example.com', password: 'User@123' });
    userToken = userLogin.body.token as string;
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('GET /products', () => {
    it('returns paginated products list with correct metadata for authenticated user', async () => {
      const res = await request(app)
        .get('/products?page=1&limit=5')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBe(5);
      expect(res.body.meta).toEqual(
        expect.objectContaining({
          page: 1,
          limit: 5,
          total: expect.any(Number),
          totalPages: expect.any(Number),
        }),
      );
    });

    it('filters products using search query "q" matching name or SKU (case-insensitive)', async () => {
      const res = await request(app)
        .get('/products?q=tape')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThan(0);
      for (const product of res.body.data) {
        const matchesName = product.name.toLowerCase().includes('tape');
        const matchesSku = product.sku.toLowerCase().includes('tape');
        expect(matchesName || matchesSku).toBe(true);
      }
    });

    it('rejects unauthenticated requests with 401 Unauthorized', async () => {
      const res = await request(app).get('/products');
      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });
  });

  describe('POST /products (Admin Only)', () => {
    const newSku = `SKU-TEST-${Date.now()}`;

    it('allows ADMIN to create a new product', async () => {
      const res = await request(app)
        .post('/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Heavy Duty Test Strapping Cart',
          sku: newSku,
          stockQty: 50,
          price: '89.99',
          imageUrl: 'https://images.unsplash.com/photo-custom-test.jpg',
        });

      expect(res.status).toBe(201);
      expect(res.body.name).toBe('Heavy Duty Test Strapping Cart');
      expect(res.body.sku).toBe(newSku);
      expect(res.body.stockQty).toBe(50);
      expect(res.body.price).toBe('89.99');
      expect(res.body.imageUrl).toBe('https://images.unsplash.com/photo-custom-test.jpg');
    });

    it('forbids regular USER from creating products with 403 Forbidden', async () => {
      const res = await request(app)
        .post('/products')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          name: 'Forbidden Product',
          sku: `SKU-FORBID-${Date.now()}`,
          stockQty: 10,
          price: '19.99',
        });

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('FORBIDDEN');
    });

    it('rejects duplicate SKU with 409 Conflict', async () => {
      const res = await request(app)
        .post('/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Duplicate SKU Product',
          sku: newSku,
          stockQty: 10,
          price: '19.99',
        });

      expect(res.status).toBe(409);
      expect(res.body.error.code).toBe('CONFLICT');
    });

    it('rejects negative stock quantity with 400 Bad Request', async () => {
      const res = await request(app)
        .post('/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Negative Stock Item',
          sku: `SKU-NEG-${Date.now()}`,
          stockQty: -5,
          price: '15.00',
        });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('BAD_REQUEST');
    });
  });

  describe('PUT /products/:id (Admin Only)', () => {
    let productId: number;

    beforeAll(async () => {
      // Find an existing product or create one
      const listRes = await request(app)
        .get('/products?limit=1')
        .set('Authorization', `Bearer ${adminToken}`);
      productId = listRes.body.data[0].id as number;
    });

    it('allows ADMIN to update product fields', async () => {
      const res = await request(app)
        .put(`/products/${productId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          stockQty: 175,
          price: '99.50',
          imageUrl: 'https://images.unsplash.com/photo-updated-custom.jpg',
        });

      expect(res.status).toBe(200);
      expect(res.body.stockQty).toBe(175);
      expect(res.body.price).toBe('99.50');
      expect(res.body.imageUrl).toBe('https://images.unsplash.com/photo-updated-custom.jpg');
    });

    it('forbids regular USER from updating product with 403 Forbidden', async () => {
      const res = await request(app)
        .put(`/products/${productId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ stockQty: 200 });

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('FORBIDDEN');
    });

    it('returns 404 for non-existent product ID', async () => {
      const res = await request(app)
        .put('/products/999999')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ stockQty: 10 });

      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });
  });
});

