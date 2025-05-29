import { Request, Response, NextFunction } from "express";
import { controllerErrorResponse } from "../middlewares/error.handlers";
import { CustomError } from "../interfaces/error.interface";
import { sendSuccess } from "../utils/response.utils";
import workoutLogServices from "../services/workout-log.services";

const createWorkoutLog = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const userId = req.params.userId;
  const programId = req.params.programId;
  const payload = req.body;

  try {
    const result = await workoutLogServices.createWorkoutLog(
      userId,
      programId,
      payload
    );
    sendSuccess(res, result.data);
  } catch (err) {
    controllerErrorResponse(res, err as CustomError);
  }
};

export default {
  createWorkoutLog,
};
