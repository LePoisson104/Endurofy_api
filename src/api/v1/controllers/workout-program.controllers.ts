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
    const result = await workoutProgramServices.getAllWorkoutPrograms(userId);
    sendSuccess(res, result.data);
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

const updateWorkoutProgramDescription = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const userId = req.params.userId;
  const programId = req.params.programId;
  const { payload } = req.body;
  try {
    const result = await workoutProgramServices.updateWorkoutProgramDescription(
      userId,
      programId,
      payload
    );

    sendSuccess(res, result);
  } catch (err) {
    controllerErrorResponse(res, err as CustomError);
  }
};

const updateWorkoutProgramDay = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const programId = req.params.programId;
  const dayId = req.params.dayId;
  const { payload } = req.body;
  try {
    const result = await workoutProgramServices.updateWorkoutProgramDay(
      programId,
      dayId,
      payload
    );

    sendSuccess(res, result);
  } catch (err) {
    controllerErrorResponse(res, err as CustomError);
  }
};

const updateWorkoutProgramExercises = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const dayId = req.params.dayId;
  const exerciseId = req.params.exerciseId;
  const { payload } = req.body;
  try {
    const result = await workoutProgramServices.updateWorkoutProgramExercises(
      dayId,
      exerciseId,
      payload
    );

    sendSuccess(res, result);
  } catch (err) {
    controllerErrorResponse(res, err as CustomError);
  }
};

const deleteWorkoutProgram = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const userId = req.params.userId;
  const programId = req.params.programId;
  try {
    const result = await workoutProgramServices.deleteWorkoutProgram(
      userId,
      programId
    );

    sendSuccess(res, result);
  } catch (err) {
    controllerErrorResponse(res, err as CustomError);
  }
};

const deleteWorkoutProgramDay = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const programId = req.params.programId;
  const dayId = req.params.dayId;
  try {
    const result = await workoutProgramServices.deleteWorkoutProgramDay(
      programId,
      dayId
    );

    sendSuccess(res, result);
  } catch (err) {
    controllerErrorResponse(res, err as CustomError);
  }
};

const deleteWorkoutProgramExercise = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const dayId = req.params.dayId;
  const exerciseId = req.params.exerciseId;
  try {
    const result = await workoutProgramServices.deleteWorkoutProgramExercise(
      dayId,
      exerciseId
    );

    sendSuccess(res, result);
  } catch (err) {
    controllerErrorResponse(res, err as CustomError);
  }
};

export default {
  createWorkoutProgram,
  getWorkoutProgram,
  deleteWorkoutProgram,
  updateWorkoutProgramDescription,
  updateWorkoutProgramDay,
  updateWorkoutProgramExercises,
  deleteWorkoutProgramDay,
  deleteWorkoutProgramExercise,
};
