import { Request, Response, NextFunction, RequestHandler } from 'express';
import { UserRole } from '../db/models/User';
import { ForbiddenError, UnauthorizedError } from '../utils/AppError';

export const authorize = (...allowedRoles: UserRole[]): RequestHandler => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new UnauthorizedError('Authentication required'));
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      next(
        new ForbiddenError(
          `Access forbidden: requires one of the following roles [${allowedRoles.join(', ')}]`,
        ),
      );
      return;
    }

    next();
  };
};

