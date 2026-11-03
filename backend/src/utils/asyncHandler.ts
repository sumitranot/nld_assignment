import { Request, Response, NextFunction, RequestHandler } from 'express';

type AsyncRequestHandler<TReq = Request, TRes = Response> = (
  req: TReq,
  res: TRes,
  next: NextFunction,
) => Promise<unknown>;

export const asyncHandler = <TReq = Request, TRes = Response>(
  fn: AsyncRequestHandler<TReq, TRes>,
): RequestHandler => {
  return (req, res, next) => {
    Promise.resolve(fn(req as unknown as TReq, res as unknown as TRes, next)).catch(next);
  };
};

