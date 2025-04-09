import { Request, Response, NextFunction } from "express";
import { controllerErrorResponse } from "../middlewares/error.handlers";
import { CustomError } from "../interfaces/error.interface";
import weightLogServices from "../services/weight-log.services";
import { sendSuccess } from "../utils/response.utils";
import { WeightLogPayload } from "../interfaces/weight-log.interface";

const getWeightLogByDate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const userId = req.params.userId;
  const startDate = new Date(req.query.startDate as string);
  const endDate = new Date(req.query.endDate as string);
  try {
    const result = await weightLogServices.getWeightLogByDate(
      userId,
      startDate,
      endDate
    );
    sendSuccess(res, result.data.weightLogs);
  } catch (err) {
    controllerErrorResponse(res, err as CustomError);
  }
};

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
      weightLogPayload
    );
    sendSuccess(res, result.data.message);
  } catch (err) {
    controllerErrorResponse(res, err as CustomError);
  }
};

const updateWeightLog = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const weightLogId = req.params.weightLogId;
  const userId = req.params.userId;
  const weightLogPayload: WeightLogPayload = req.body;

  try {
    const result = await weightLogServices.updateWeightLog(
      weightLogId,
      userId,
      weightLogPayload
    );
    sendSuccess(res, result.data.message);
  } catch (err) {
    controllerErrorResponse(res, err as CustomError);
  }
};

const deleteWeightLog = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const weightLogId = req.params.weightLogId;
  const userId = req.params.userId;

  try {
    const result = await weightLogServices.deleteWeightLog(weightLogId, userId);
    sendSuccess(res, result.data.message);
  } catch (err) {
    controllerErrorResponse(res, err as CustomError);
  }
};

export default {
  createWeightLog,
  getWeightLogByDate,
  deleteWeightLog,
  updateWeightLog,
};
