import { Request, Response, NextFunction } from "express";
import { controllerErrorResponse } from "../middlewares/error.handlers";
import { CustomError } from "../interfaces/error.interface";
import { sendSuccess } from "../utils/response.utils";
import workoutLogServices from "../services/workout-log.services";

const getWorkoutLogPagination = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const userId = req.params.userId;
  const programId = req.params.programId;
  const limit = parseInt(req.params.limit);
  const offset = parseInt(req.params.offset);

  try {
    const result = await workoutLogServices.getWorkoutLogPagination(
      userId,
      programId,
      limit,
      offset
    );
    sendSuccess(res, result.data);
  } catch (err) {
    controllerErrorResponse(res, err as CustomError);
  }
};

const getPreviousWorkoutLog = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const userId = req.params.userId;
  const programId = req.params.programId;
  const dayId = req.params.dayId;
  const currentWorkoutDate = req.params.currentWorkoutDate;

  try {
    const result = await workoutLogServices.getPreviousWorkoutLog(
      userId,
      programId,
      dayId,
      currentWorkoutDate
    );
    sendSuccess(res, result.data);
  } catch (err) {
    controllerErrorResponse(res, err as CustomError);
  }
};

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

const getCompletedWorkoutLogs = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const userId = req.params.userId;
  const programId = req.params.programId;
  const startDate = req.params.startDate;
  const endDate = req.params.endDate;

  try {
    const result = await workoutLogServices.getCompletedWorkoutLogs(
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

const getWorkoutLogDates = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const userId = req.params.userId;
  const programId = req.params.programId;
  const startDate = req.params.startDate;
  const endDate = req.params.endDate;

  try {
    const result = await workoutLogServices.getWorkoutLogDates(
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
  const dayId = req.params.dayId;
  const payload = req.body;

  try {
    const result = await workoutLogServices.createWorkoutLog(
      userId,
      programId,
      dayId,
      payload
    );
    sendSuccess(res, result.data);
  } catch (err) {
    controllerErrorResponse(res, err as CustomError);
  }
};

const createManualWorkoutLog = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const userId = req.params.userId;
  const programId = req.params.programId;
  const dayId = req.params.dayId;
  const payload = req.body;

  try {
    const result = await workoutLogServices.createManualWorkoutLog(
      userId,
      programId,
      dayId,
      payload
    );
    sendSuccess(res, result.data);
  } catch (err) {
    controllerErrorResponse(res, err as CustomError);
  }
};

const addManualWorkoutExercise = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const workoutLogId = req.params.workoutLogId;
  const programExerciseId = req.params.programExerciseId;
  const payload = req.body;

  try {
    const result = await workoutLogServices.addManualWorkoutExercise(
      workoutLogId,
      programExerciseId,
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

const updateWorkoutLogName = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const workoutLogId = req.params.workoutLogId;
  const title = req.body.title;

  try {
    const result = await workoutLogServices.updateWorkoutLogName(
      workoutLogId,
      title
    );
    sendSuccess(res, result.data.message);
  } catch (err) {
    controllerErrorResponse(res, err as CustomError);
  }
};

const updateWorkoutLogStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const workoutLogId = req.params.workoutLogId;
  const status = req.body.status;

  try {
    const result = await workoutLogServices.updateWorkoutLogStatus(
      workoutLogId,
      status
    );
    sendSuccess(res, result.data);
  } catch (err) {
    controllerErrorResponse(res, err as CustomError);
  }
};

const updateWorkoutSet = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const workoutSetId = req.params.workoutSetId;
  const workoutExerciseId = req.params.workoutExerciseId;
  const workoutSetPayload = req.body;

  try {
    const result = await workoutLogServices.updateWorkoutSet(
      workoutSetId,
      workoutExerciseId,
      workoutSetPayload
    );
    sendSuccess(res, result.data);
  } catch (err) {
    controllerErrorResponse(res, err as CustomError);
  }
};

const deleteWorkoutLog = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const workoutLogId = req.params.workoutLogId;

  try {
    const result = await workoutLogServices.deleteWorkoutLog(workoutLogId);
    sendSuccess(res, result.data.message);
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
  createManualWorkoutLog,
  addManualWorkoutExercise,
  getWorkoutLogByDate,
  getWorkoutLogDates,
  deleteWorkoutSetWithCascade,
  updateExerciseNotes,
  updateWorkoutSet,
  updateWorkoutLogName,
  updateWorkoutLogStatus,
  getCompletedWorkoutLogs,
  getPreviousWorkoutLog,
  getWorkoutLogPagination,
  deleteWorkoutLog,
};
