export interface CustomError extends Error {
  statusCode: number;
  isOperational: boolean;
  details?: any;
  code: string;
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
