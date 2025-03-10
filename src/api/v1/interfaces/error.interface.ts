export interface CustomError extends Error {
  statusCode: number;
  isOperational: boolean;
  code?: string;
  details?: any;
}

export type ValidationError = {
  field: string;
  message: string;
};

export type ErrorResponse = {
  status: "error";
  code: string;
  message: string;
  errors?: ValidationError[];
  stack?: string;
  details?: any;
};
