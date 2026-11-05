import { Request, Response, NextFunction, RequestHandler } from 'express';
type AsyncRequestHandler<TReq = Request, TRes = Response> = (req: TReq, res: TRes, next: NextFunction) => Promise<unknown>;
export declare const asyncHandler: <TReq = Request, TRes = Response>(fn: AsyncRequestHandler<TReq, TRes>) => RequestHandler;
export {};
