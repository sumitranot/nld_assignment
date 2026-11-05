import { RequestHandler } from 'express';
import { ZodTypeAny } from 'zod';
export interface RequestValidationSchemas {
    body?: ZodTypeAny;
    query?: ZodTypeAny;
    params?: ZodTypeAny;
}
export declare const validate: (schemas: RequestValidationSchemas) => RequestHandler;
