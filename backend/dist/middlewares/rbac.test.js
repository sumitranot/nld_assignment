"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const authorize_1 = require("./authorize");
const requireAccess_1 = require("./requireAccess");
const AppError_1 = require("../utils/AppError");
describe('RBAC Middlewares Unit Tests', () => {
    const createMockReq = (role, access) => ({
        user: role
            ? {
                role,
                access: access ?? null,
            }
            : undefined,
    });
    const mockRes = {};
    describe('authorize middleware', () => {
        it('calls next() when user has allowed role', () => {
            const req = createMockReq('ADMIN');
            const next = jest.fn();
            (0, authorize_1.authorize)('ADMIN')(req, mockRes, next);
            expect(next).toHaveBeenCalledWith();
        });
        it('passes ForbiddenError when user has unpermitted role', () => {
            const req = createMockReq('USER');
            const next = jest.fn();
            (0, authorize_1.authorize)('ADMIN')(req, mockRes, next);
            expect(next).toHaveBeenCalledWith(expect.any(AppError_1.ForbiddenError));
        });
        it('passes UnauthorizedError when req.user is missing', () => {
            const req = createMockReq();
            const next = jest.fn();
            (0, authorize_1.authorize)('ADMIN')(req, mockRes, next);
            expect(next).toHaveBeenCalledWith(expect.any(AppError_1.UnauthorizedError));
        });
    });
    describe('requireAccess middleware', () => {
        it('allows ADMIN to bypass granular access checks unconditionally', () => {
            const req = createMockReq('ADMIN', null);
            const next = jest.fn();
            (0, requireAccess_1.requireAccess)('CREATE')(req, mockRes, next);
            expect(next).toHaveBeenCalledWith();
        });
        it('allows USER with CREATE access to execute CREATE actions', () => {
            const req = createMockReq('USER', 'CREATE');
            const next = jest.fn();
            (0, requireAccess_1.requireAccess)('CREATE')(req, mockRes, next);
            expect(next).toHaveBeenCalledWith();
        });
        it('allows USER with CREATE access to execute VIEW actions (CREATE implies VIEW)', () => {
            const req = createMockReq('USER', 'CREATE');
            const next = jest.fn();
            (0, requireAccess_1.requireAccess)('VIEW')(req, mockRes, next);
            expect(next).toHaveBeenCalledWith();
        });
        it('allows USER with VIEW access to execute VIEW actions', () => {
            const req = createMockReq('USER', 'VIEW');
            const next = jest.fn();
            (0, requireAccess_1.requireAccess)('VIEW')(req, mockRes, next);
            expect(next).toHaveBeenCalledWith();
        });
        it('forbids USER with VIEW access from executing CREATE actions', () => {
            const req = createMockReq('USER', 'VIEW');
            const next = jest.fn();
            (0, requireAccess_1.requireAccess)('CREATE')(req, mockRes, next);
            expect(next).toHaveBeenCalledWith(expect.any(AppError_1.ForbiddenError));
        });
    });
});
//# sourceMappingURL=rbac.test.js.map