import { Request, Response, NextFunction } from "express";
import { controllerErrorResponse } from "../middlewares/error.handlers";
import { CustomError } from "../interfaces/error.interface";
import { sendSuccess } from "../utils/response.utils";
import { WorkoutProgramRequest } from "../interfaces/workout-program.interface";
import workoutProgramServices from "../services/workout-program.services";

const getWorkoutProgram = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const userId = req.params.userId;

  try {
    const result = await workoutProgramServices.getWorkoutProgram(userId);
    sendSuccess(res, result);
  } catch (err) {
    controllerErrorResponse(res, err as CustomError);
  }
};

const createWorkoutProgram = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const userId = req.params.userId;
  const workoutProgram = req.body as WorkoutProgramRequest;

  try {
    const result = await workoutProgramServices.createWorkoutProgram(
      userId,
      workoutProgram
    );

    sendSuccess(res, result);
  } catch (err) {
    controllerErrorResponse(res, err as CustomError);
  }
};

export default {
  createWorkoutProgram,
  getWorkoutProgram,
};
