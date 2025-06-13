import { Request, Response, NextFunction } from "express";
import { controllerErrorResponse } from "../middlewares/error.handlers";
import { CustomError } from "../interfaces/error.interface";
import { sendSuccess } from "../utils/response.utils";
import workoutLogServices from "../services/workout-log.services";

const getWorkoutLogByDate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const userId = req.params.userId;
  const programId = req.params.programId;
  const startDate = req.params.startDate;
  const endDate = req.params.endDate;

  try {
    const result = await workoutLogServices.getWorkoutLogData(
      userId,
      programId,
      startDate,
      endDate
    );
    sendSuccess(res, result.data);
  } catch (err) {
    controllerErrorResponse(res, err as CustomError);
  }
};

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

const updateExerciseNotes = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const workoutExerciseId = req.params.workoutExerciseId;
  const exerciseNotes = req.body.exerciseNotes;

  try {
    const result = await workoutLogServices.updateExerciseNotes(
      workoutExerciseId,
      exerciseNotes
    );
    sendSuccess(res, result.data);
  } catch (err) {
    controllerErrorResponse(res, err as CustomError);
  }
};

const deleteWorkoutSetWithCascade = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const workoutSetId = req.params.workoutSetId;
  const workoutExerciseId = req.params.workoutExerciseId;
  const workoutLogId = req.params.workoutLogId;

  try {
    const result = await workoutLogServices.deleteWorkoutSetWithCascade(
      workoutSetId,
      workoutExerciseId,
      workoutLogId
    );
    sendSuccess(res, result.data);
  } catch (err) {
    controllerErrorResponse(res, err as CustomError);
  }
};

export default {
  createWorkoutLog,
  getWorkoutLogByDate,
  deleteWorkoutSetWithCascade,
  updateExerciseNotes,
};
