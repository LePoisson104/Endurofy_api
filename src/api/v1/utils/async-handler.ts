import { Request, Response, NextFunction, RequestHandler } from "express";

// Wrapper for async route handlers to automatically catch errors
export const asyncHandler = (fn: RequestHandler): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
