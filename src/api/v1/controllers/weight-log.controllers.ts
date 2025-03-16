import { Request, Response, NextFunction } from "express";
import { controllerErrorResponse } from "../middlewares/error.handlers";
import { CustomError } from "../interfaces/error.interface";
import weightLogServices from "../services/weight-log.services";
import { sendSuccess } from "../utils/response.utils";
import { WeightLogPayload } from "../interfaces/weight-log.interface";

const createWeightLog = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const userId = req.params.userId;
  const weightLogPayload: WeightLogPayload = req.body;
  try {
    const result = await weightLogServices.createWeightLog(
      userId,
      weightLogPayload.weight,
      weightLogPayload.weight_unit,
      weightLogPayload.calories_intake,
      weightLogPayload.date
    );
    sendSuccess(res, result.data.message);
  } catch (err) {
    controllerErrorResponse(res, err as CustomError);
  }
};

export default {
  createWeightLog,
};
