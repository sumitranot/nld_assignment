import { Request, Response, NextFunction, RequestHandler } from 'express';
import { ZodTypeAny, ZodError } from 'zod';
import { BadRequestError } from '../utils/AppError';

export interface RequestValidationSchemas {
  body?: ZodTypeAny;
  query?: ZodTypeAny;
  params?: ZodTypeAny;
}

export const validate = (schemas: RequestValidationSchemas): RequestHandler => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    void (async (): Promise<void> => {
      try {
        if (schemas.params) {
          const parsedParams: unknown = await schemas.params.parseAsync(req.params);
          req.params = parsedParams as Request['params'];
        }

        if (schemas.query) {
          const parsedQuery: unknown = await schemas.query.parseAsync(req.query);
          req.query = parsedQuery as Request['query'];
        }

        if (schemas.body) {
          const parsedBody: unknown = await schemas.body.parseAsync(req.body);
          req.body = parsedBody;
        }

        next();
      } catch (err) {
        if (err instanceof ZodError) {
          const formatted = err.errors.map((e) => ({
            field: e.path.join('.'),
            message: e.message,
          }));
          next(new BadRequestError('Validation failed', formatted));
          return;
        }
        next(err);
      }
    })();
  };
};
