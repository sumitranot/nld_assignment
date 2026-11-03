import { Request, Response } from 'express';
import { NotFoundError } from '../utils/AppError';

export const notFound = (req: Request, _res: Response): void => {
  throw new NotFoundError(`Endpoint ${req.method} ${req.originalUrl} not found`);
};

