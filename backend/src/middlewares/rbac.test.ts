import { Request, Response } from 'express';
import { authorize } from './authorize';
import { requireAccess } from './requireAccess';
import { User, UserRole, UserAccess } from '../db/models/User';
import { ForbiddenError, UnauthorizedError } from '../utils/AppError';

describe('RBAC Middlewares Unit Tests', () => {
  const createMockReq = (role?: UserRole, access?: UserAccess | null): Partial<Request> => ({
    user: role
      ? ({
          role,
          access: access ?? null,
        } as unknown as User)
      : undefined,
  });

  const mockRes = {} as Response;

  describe('authorize middleware', () => {
    it('calls next() when user has allowed role', () => {
      const req = createMockReq('ADMIN');
      const next = jest.fn();

      authorize('ADMIN')(req as Request, mockRes, next);
      expect(next).toHaveBeenCalledWith();
    });

    it('passes ForbiddenError when user has unpermitted role', () => {
      const req = createMockReq('USER');
      const next = jest.fn();

      authorize('ADMIN')(req as Request, mockRes, next);
      expect(next).toHaveBeenCalledWith(expect.any(ForbiddenError));
    });

    it('passes UnauthorizedError when req.user is missing', () => {
      const req = createMockReq();
      const next = jest.fn();

      authorize('ADMIN')(req as Request, mockRes, next);
      expect(next).toHaveBeenCalledWith(expect.any(UnauthorizedError));
    });
  });

  describe('requireAccess middleware', () => {
    it('allows ADMIN to bypass granular access checks unconditionally', () => {
      const req = createMockReq('ADMIN', null);
      const next = jest.fn();

      requireAccess('CREATE')(req as Request, mockRes, next);
      expect(next).toHaveBeenCalledWith();
    });

    it('allows USER with CREATE access to execute CREATE actions', () => {
      const req = createMockReq('USER', 'CREATE');
      const next = jest.fn();

      requireAccess('CREATE')(req as Request, mockRes, next);
      expect(next).toHaveBeenCalledWith();
    });

    it('allows USER with CREATE access to execute VIEW actions (CREATE implies VIEW)', () => {
      const req = createMockReq('USER', 'CREATE');
      const next = jest.fn();

      requireAccess('VIEW')(req as Request, mockRes, next);
      expect(next).toHaveBeenCalledWith();
    });

    it('allows USER with VIEW access to execute VIEW actions', () => {
      const req = createMockReq('USER', 'VIEW');
      const next = jest.fn();

      requireAccess('VIEW')(req as Request, mockRes, next);
      expect(next).toHaveBeenCalledWith();
    });

    it('forbids USER with VIEW access from executing CREATE actions', () => {
      const req = createMockReq('USER', 'VIEW');
      const next = jest.fn();

      requireAccess('CREATE')(req as Request, mockRes, next);
      expect(next).toHaveBeenCalledWith(expect.any(ForbiddenError));
    });
  });
});
