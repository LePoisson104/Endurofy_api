import { Response } from "express";

export interface SuccessResponse<T = any> {
  status: "success";
  message: string;
  data?: T;
}

export const sendSuccess = <T>(
  res: Response,
  data?: T,
  message: string = "Success",
  statusCode: number = 200
): Response => {
  const response: SuccessResponse<T> = {
    status: "success",
    message,
    ...(data !== undefined && { data }),
  };

  return res.status(statusCode).json(response);
};

export const sendCreated = <T>(
  res: Response,
  data?: T,
  message: string = "Resource created successfully"
): Response => {
  return sendSuccess(res, data, message, 201);
};

export const sendNoContent = (res: Response): Response => {
  return res.status(204).send();
};

export const sendAccepted = <T>(
  res: Response,
  data?: T,
  message: string = "Request accepted"
): Response => {
  return sendSuccess(res, data, message, 202);
};
