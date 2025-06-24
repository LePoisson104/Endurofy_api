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
      message: validationErrors[0].message,
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
  details?: any;
  code: string;

  constructor(
    message: string,
    statusCode: number,
    details?: any,
    code: string = "APP_ERROR"
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
  // Determine what to expose to the client

  // Base error response (always safe to expose)
  const errorResponse: ErrorResponse = {
    status: "error",
    code: err.code || "INTERNAL_SERVER_ERROR",
    message: getSafeErrorMessage(err),
  };

  // In a real application, you would want to log this error
  Logger.logEvents(
    `Controller Error: ${JSON.stringify({
      code: err.code,
      message: err.message,
      stack: err.stack,
      details: err.details,
    })}`,
    "errLog.log"
  );

  await Logger.logEvents(
    `Controller Error: ${JSON.stringify(errorResponse)}`,
    "errLog.log"
  );

  return res.status(statusCode).json(errorResponse);
};

const getSafeErrorMessage = (err: CustomError): string => {
  // Map internal errors to safe public messages
  const safeMessages: Record<string, string> = {
    DATABASE_ERROR: "A database error occurred",
    INTERNAL_SERVER_ERROR: "An error occurred while processing your request",
    AUTH_ERROR: "Authentication failed",
    PERMISSION_ERROR: "Access denied",
    RATE_LIMIT_ERROR: "Too many requests",
    EXTERNAL_API_ERROR: "External service unavailable",
    APP_ERROR: err.message,
  };

  // Return safe message if available, otherwise generic message
  return (
    safeMessages[err.code || ""] ||
    "An error occurred while processing your request"
  );
};
