import { Request, Response, NextFunction } from "express";
import weightLogServices from "../services/weight-log.services";
import { sendSuccess } from "../utils/response.utils";
import { WeightLogPayload } from "../interfaces/weight-log.interface";
import { asyncHandler } from "../utils/async-handler";

const getWeightLogByDate = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.params.userId;
    const startDate = new Date(req.query.startDate as string);
    const endDate = new Date(req.query.endDate as string);
    const options = req.query.options as string;
    const withRates = req.query.withRates as string;
    const result = await weightLogServices.getWeightLogByRange(
      userId,
      startDate,
      endDate,
      options as "all" | "date",
      withRates
    );
    sendSuccess(res, result.data.weightLogs);
  }
);

const getWeightLogDatesByRange = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.params.userId;
    const startDate = new Date(req.query.startDate as string);
    const endDate = new Date(req.query.endDate as string);
    const result = await weightLogServices.getWeightLogDatesByRange(
      userId,
      startDate,
      endDate
    );
    sendSuccess(res, result.data.weightLogDates);
  }
);

const getWeeklyWeightDifference = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.params.userId;
    const result = await weightLogServices.getWeeklyWeightDifference(userId);
    sendSuccess(res, result.data);
  }
);

const createWeightLog = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.params.userId;
    const weightLogPayload: WeightLogPayload = req.body;

    const result = await weightLogServices.createWeightLog(
      userId,
      weightLogPayload
    );
    sendSuccess(res, result.data.message);
  }
);

const updateWeightLog = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const weightLogId = req.params.weightLogId;
    const userId = req.params.userId;
    const weightLogPayload: WeightLogPayload = req.body;

    const result = await weightLogServices.updateWeightLog(
      weightLogId,
      userId,
      weightLogPayload
    );
    sendSuccess(res, result.data.message);
  }
);

const deleteWeightLog = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const weightLogId = req.params.weightLogId;
    const userId = req.params.userId;

    const result = await weightLogServices.deleteWeightLog(weightLogId, userId);
    sendSuccess(res, result.data.message);
  }
);

export default {
  createWeightLog,
  getWeightLogByDate,
  getWeeklyWeightDifference,
  deleteWeightLog,
  updateWeightLog,
  getWeightLogDatesByRange,
};
