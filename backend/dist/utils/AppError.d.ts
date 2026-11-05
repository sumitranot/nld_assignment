export type ErrorCode = 'BAD_REQUEST' | 'UNAUTHORIZED' | 'FORBIDDEN' | 'NOT_FOUND' | 'CONFLICT' | 'UNPROCESSABLE_ENTITY' | 'TOO_MANY_REQUESTS' | 'INTERNAL_SERVER_ERROR';
export declare class AppError extends Error {
    readonly statusCode: number;
    readonly errorCode: ErrorCode;
    readonly details?: unknown;
    readonly isOperational: boolean;
    constructor(message: string, statusCode?: number, errorCode?: ErrorCode, details?: unknown);
}
export declare class BadRequestError extends AppError {
    constructor(message?: string, details?: unknown);
}
export declare class UnauthorizedError extends AppError {
    constructor(message?: string, details?: unknown);
}
export declare class ForbiddenError extends AppError {
    constructor(message?: string, details?: unknown);
}
export declare class NotFoundError extends AppError {
    constructor(message?: string, details?: unknown);
}
export declare class ConflictError extends AppError {
    constructor(message?: string, details?: unknown);
}
export declare class UnprocessableEntityError extends AppError {
    constructor(message?: string, details?: unknown);
}
export declare class InternalServerError extends AppError {
    constructor(message?: string, details?: unknown);
}
