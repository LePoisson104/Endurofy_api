import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";
import { CustomError } from "../interfaces/error.interface";

export const handleValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }
  next();
};

export class ErrorResponse extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message); // Pass the message to the base Error class
    this.statusCode = statusCode; // Add a custom statusCode property
    this.isOperational = true; // Optional flag to differentiate operational errors
    // Captures where the error originated from (Node.js only)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export const controllerErrorResponse = (
  res: Response,
  err: CustomError
): Response => {
  const statusCode: number = err.statusCode || 500;
  return res.status(statusCode).json({ mesasge: err.message });
};
