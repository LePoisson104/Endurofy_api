import { NextFunction, Request, Response } from "express";
import { controllerErrorResponse } from "../middlewares/error.handlers";
import { CustomError } from "../interfaces/error.interface";
import usersServices from "../services/users.services";
import { sendSuccess } from "../utils/response.utils";

const getUsersInfo = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const userId = req.params.userId;

  try {
    const result = await usersServices.getUsersInfo(userId);
    sendSuccess(res, result.data.userInfo);
  } catch (err) {
    controllerErrorResponse(res, err as CustomError);
  }
};

export default { getUsersInfo };
