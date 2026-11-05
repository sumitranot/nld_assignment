import { Request, Response, NextFunction } from 'express';
export interface ErrorResponseBody {
    error: {
        code: string;
        message: string;
        details?: unknown;
    };
}
export declare const errorHandler: (err: Error, _req: Request, res: Response<ErrorResponseBody>, _next: NextFunction) => void;
