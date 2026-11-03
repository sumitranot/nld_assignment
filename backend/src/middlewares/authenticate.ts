import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { User } from '../db/models/User';
import { UnauthorizedError } from '../utils/AppError';
import { JWTPayload } from '../modules/auth/auth.dto';

export const authenticate = async (
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('Missing or malformed Authorization header');
    }

    const token = authHeader.substring(7).trim();
    if (!token) {
      throw new UnauthorizedError('Authentication token missing');
    }

    let payload: JWTPayload;
    try {
      payload = jwt.verify(token, env.JWT_SECRET) as unknown as JWTPayload;
    } catch (jwtErr) {
      if (jwtErr instanceof jwt.TokenExpiredError) {
        throw new UnauthorizedError('Token expired');
      }
      throw new UnauthorizedError('Invalid authentication token');
    }

    // Security requirement: Roles/access are embedded in the JWT AND re-validated against the DB user on each request
    const user = await User.findByPk(payload.sub);
    if (!user) {
      throw new UnauthorizedError('User account not found or session revoked');
    }

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};
