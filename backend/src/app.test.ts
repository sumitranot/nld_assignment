import request from 'supertest';
import { app } from './app';

describe('App Root Endpoints & Documentation', () => {
  it('GET /health returns 200 and status ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body).toHaveProperty('timestamp');
  });

  it('GET /docs returns interactive Swagger UI HTML page', async () => {
    const res = await request(app).get('/docs');
    expect(res.status).toBe(200);
    expect(res.text).toContain('NLD Assessment');
    expect(res.text).toContain('SwaggerUIBundle');
  });

  it('GET /docs/openapi.json returns valid OpenAPI 3.0 specification', async () => {
    const res = await request(app).get('/docs/openapi.json');
    expect(res.status).toBe(200);
    expect(res.body.openapi).toBe('3.0.3');
    expect(res.body.info.title).toContain('NLD Assessment');
    expect(res.body.paths).toHaveProperty('/orders');
    expect(res.body.paths).toHaveProperty('/products');
    expect(res.body.paths).toHaveProperty('/auth/login');
  });

  it('GET unhandled route returns 404 with standard ErrorResponse', async () => {
    const res = await request(app).get('/api/does-not-exist');
    expect(res.status).toBe(404);
    expect(res.body.error).toEqual(
      expect.objectContaining({
        code: 'NOT_FOUND',
        message: expect.stringContaining('not found'),
      }),
    );
  });
});

