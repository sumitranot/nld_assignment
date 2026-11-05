"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const app_1 = require("../../app");
const models_1 = require("../../db/models");
describe('Auth & RBAC Integration Tests', () => {
    beforeAll(async () => {
        await models_1.sequelize.authenticate();
    });
    afterAll(async () => {
        await models_1.sequelize.close();
    });
    const uniqueId = Date.now();
    const testUser = {
        email: `test_user_${uniqueId}@example.com`,
        password: 'Password@123',
        role: 'USER',
        access: 'VIEW',
    };
    describe('POST /auth/register', () => {
        it('successfully registers a new user with bcrypt-hashed password', async () => {
            const res = await (0, supertest_1.default)(app_1.app)
                .post('/auth/register')
                .send(testUser);
            expect(res.status).toBe(201);
            expect(res.body).toHaveProperty('token');
            expect(res.body).toHaveProperty('user');
            expect(res.body.user.email).toBe(testUser.email.toLowerCase());
            expect(res.body.user.role).toBe('USER');
            expect(res.body.user.access).toBe('VIEW');
            expect(res.body.user).not.toHaveProperty('passwordHash');
        });
        it('rejects duplicate email with 409 Conflict', async () => {
            const res = await (0, supertest_1.default)(app_1.app)
                .post('/auth/register')
                .send(testUser);
            expect(res.status).toBe(409);
            expect(res.body.error.code).toBe('CONFLICT');
        });
        it('rejects passwords under 6 characters with 400 Bad Request', async () => {
            const res = await (0, supertest_1.default)(app_1.app)
                .post('/auth/register')
                .send({
                email: `short_${Date.now()}@example.com`,
                password: '123',
                role: 'USER',
            });
            expect(res.status).toBe(400);
            expect(res.body.error.code).toBe('BAD_REQUEST');
            expect(res.body.error.details).toEqual(expect.arrayContaining([
                expect.objectContaining({ field: 'password' }),
            ]));
        });
        it('rejects invalid roles with 400 Bad Request', async () => {
            const res = await (0, supertest_1.default)(app_1.app)
                .post('/auth/register')
                .send({
                email: `invalid_role_${Date.now()}@example.com`,
                password: 'Password@123',
                role: 'SUPERADMIN',
            });
            expect(res.status).toBe(400);
            expect(res.body.error.code).toBe('BAD_REQUEST');
        });
    });
    describe('POST /auth/login', () => {
        it('successfully authenticates seeded admin and issues JWT', async () => {
            const res = await (0, supertest_1.default)(app_1.app)
                .post('/auth/login')
                .send({
                email: 'admin@example.com',
                password: 'Admin@123',
            });
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('token');
            expect(res.body.user.email).toBe('admin@example.com');
            expect(res.body.user.role).toBe('ADMIN');
        });
        it('returns generic "Invalid credentials" (401) on wrong password', async () => {
            const res = await (0, supertest_1.default)(app_1.app)
                .post('/auth/login')
                .send({
                email: 'admin@example.com',
                password: 'WrongPassword999',
            });
            expect(res.status).toBe(401);
            expect(res.body.error.code).toBe('UNAUTHORIZED');
            expect(res.body.error.message).toBe('Invalid credentials');
        });
        it('returns generic "Invalid credentials" (401) on non-existent email', async () => {
            const res = await (0, supertest_1.default)(app_1.app)
                .post('/auth/login')
                .send({
                email: 'does_not_exist@example.com',
                password: 'Password@123',
            });
            expect(res.status).toBe(401);
            expect(res.body.error.code).toBe('UNAUTHORIZED');
            expect(res.body.error.message).toBe('Invalid credentials');
        });
    });
    describe('GET /auth/me (JWT Authentication Guard)', () => {
        it('retrieves current user profile when valid Bearer token provided', async () => {
            const loginRes = await (0, supertest_1.default)(app_1.app)
                .post('/auth/login')
                .send({
                email: 'admin@example.com',
                password: 'Admin@123',
            });
            const token = loginRes.body.token;
            const meRes = await (0, supertest_1.default)(app_1.app)
                .get('/auth/me')
                .set('Authorization', `Bearer ${token}`);
            expect(meRes.status).toBe(200);
            expect(meRes.body.user.email).toBe('admin@example.com');
            expect(meRes.body.user.role).toBe('ADMIN');
        });
        it('rejects request without token with 401 Unauthorized', async () => {
            const res = await (0, supertest_1.default)(app_1.app).get('/auth/me');
            expect(res.status).toBe(401);
            expect(res.body.error.code).toBe('UNAUTHORIZED');
        });
        it('rejects request with forged/invalid token with 401 Unauthorized', async () => {
            const res = await (0, supertest_1.default)(app_1.app)
                .get('/auth/me')
                .set('Authorization', 'Bearer invalid.jwt.token');
            expect(res.status).toBe(401);
            expect(res.body.error.code).toBe('UNAUTHORIZED');
        });
    });
});
//# sourceMappingURL=auth.test.js.map