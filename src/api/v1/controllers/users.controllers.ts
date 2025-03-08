import { Request, Response } from "express";
import { controllerErrorResponse } from "../middlewares/error.handlers";
import { CustomError } from "../interfaces/error.interface";
import { userInterface } from "../interfaces/user.interface";
import usersServices from "../services/users.services";

const getUsersInfo = async (req: Request, res: Response): Promise<any> => {
  const { userId } = req.params;
  try {
    const result = await usersServices.getUsersInfo(userId);
    return res.status(200).json(result);
  } catch (err) {
    controllerErrorResponse(res, err as CustomError);
  }
};

export default { getUsersInfo };
