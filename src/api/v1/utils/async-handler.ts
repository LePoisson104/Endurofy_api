import { Response, NextFunction, RequestHandler, Request } from "express";
import { AuthenticatedRequest } from "../interfaces/request.interfaces";
// Wrapper for async route handlers to automatically catch errors
export const asyncHandler = (
  fn: (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => Promise<void>
): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req as AuthenticatedRequest, res, next)).catch(next);
  };
};
