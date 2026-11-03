import { Request, Response, NextFunction, RequestHandler } from 'express';
import { UserAccess } from '../db/models/User';
import { ForbiddenError, UnauthorizedError } from '../utils/AppError';

export const requireAccess = (requiredAccess: UserAccess): RequestHandler => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new UnauthorizedError('Authentication required'));
      return;
    }

    // Design Decision: ADMIN bypasses granular access checks
    if (req.user.role === 'ADMIN') {
      next();
      return;
    }

    const userAccess = req.user.access;

    // Design Decision: CREATE implies VIEW permissions
    if (requiredAccess === 'VIEW') {
      if (userAccess === 'VIEW' || userAccess === 'CREATE') {
        next();
        return;
      }
    } else if (requiredAccess === 'CREATE') {
      if (userAccess === 'CREATE') {
        next();
        return;
      }
    }

    next(
      new ForbiddenError(
        `Action requires '${requiredAccess}' access privilege. Your current access is '${userAccess ?? 'NONE'}'.`,
      ),
    );
  };
};

