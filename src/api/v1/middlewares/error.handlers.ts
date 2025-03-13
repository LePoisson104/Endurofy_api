import { Request, Response, NextFunction } from "express";
import {
  validationResult,
  ValidationError as ExpressValidationError,
} from "express-validator";
import {
  CustomError,
  ErrorResponse,
  ValidationError,
} from "../interfaces/error.interface";
import Logger from "../utils/logger";

export const handleValidationErrors = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const validationErrors: ValidationError[] = errors
      .array()
      .map((err: ExpressValidationError) => ({
        field: err.type === "field" ? err.path : "unknown",
        message: err.msg,
      }));

    const errorResponse: ErrorResponse = {
      status: "error",
      code: "VALIDATION_ERROR",
      message: "Validation failed",
      errors: validationErrors,
    };

    await Logger.logEvents(
      `Validation Error: ${JSON.stringify(errorResponse)}`,
      "errLog.log"
    );

    res.status(400).json(errorResponse);
    return;
  }
  next();
};

export class AppError extends Error implements CustomError {
  statusCode: number;
  isOperational: boolean;
  code?: string;
  details?: any;

  constructor(
    message: string,
    statusCode: number,
    code?: string,
    details?: any
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    this.code = code;
    this.details = details;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export const controllerErrorResponse = async (
  res: Response,
  err: CustomError
): Promise<Response> => {
  const statusCode = err.statusCode || 500;
  const errorResponse: ErrorResponse = {
    status: "error",
    code: err.code || "INTERNAL_SERVER_ERROR",
    message: err.message,
    details: err.details,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  };

  // In a real application, you would want to log this error
  console.error({
    code: err.code,
    message: err.message,
    stack: err.stack,
    details: err.details,
  });

  await Logger.logEvents(
    `Controller Error: ${JSON.stringify(errorResponse)}`,
    "errLog.log"
  );

  return res.status(statusCode).json(errorResponse);
};
