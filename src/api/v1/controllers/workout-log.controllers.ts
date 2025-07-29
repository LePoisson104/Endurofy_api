import { Request, Response, NextFunction } from "express";
import { sendSuccess } from "../utils/response.utils";
import workoutLogServices from "../services/workout-log.services";
import { asyncHandler } from "../utils/async-handler";

const getManualWorkoutLogWithPrevious = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.params.userId;
    const programId = req.params.programId;
    const workoutDate = req.params.workoutDate;

    const result = await workoutLogServices.getManualWorkoutLogWithPrevious(
      userId,
      programId,
      workoutDate
    );
    sendSuccess(res, result.data);
  }
);

const getWorkoutLogPagination = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.params.userId;
    const programId = req.params.programId;
    const limit = parseInt(req.params.limit);
    const offset = parseInt(req.params.offset);

    const result = await workoutLogServices.getWorkoutLogPagination(
      userId,
      programId,
      limit,
      offset
    );
    sendSuccess(res, result.data);
  }
);

const getPreviousWorkoutLog = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.params.userId;
    const programId = req.params.programId;
    const dayId = req.params.dayId;
    const currentWorkoutDate = req.params.currentWorkoutDate;

    const result = await workoutLogServices.getPreviousWorkoutLog(
      userId,
      programId,
      dayId,
      currentWorkoutDate
    );
    sendSuccess(res, result.data);
  }
);

const getWorkoutLogByDate = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.params.userId;
    const programId = req.params.programId;
    const startDate = req.params.startDate;
    const endDate = req.params.endDate;

    const result = await workoutLogServices.getWorkoutLogData(
      userId,
      programId,
      startDate,
      endDate
    );
    sendSuccess(res, result.data);
  }
);

const getCompletedWorkoutLogs = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.params.userId;
    const programId = req.params.programId;
    const startDate = req.params.startDate;
    const endDate = req.params.endDate;

    const result = await workoutLogServices.getCompletedWorkoutLogs(
      userId,
      programId,
      startDate,
      endDate
    );
    sendSuccess(res, result.data);
  }
);

const getWorkoutLogDates = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.params.userId;
    const programId = req.params.programId;
    const startDate = req.params.startDate;
    const endDate = req.params.endDate;

    const result = await workoutLogServices.getWorkoutLogDates(
      userId,
      programId,
      startDate,
      endDate
    );
    sendSuccess(res, result.data);
  }
);

const createWorkoutLog = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.params.userId;
    const programId = req.params.programId;
    const dayId = req.params.dayId;
    const payload = req.body;

    const result = await workoutLogServices.createWorkoutLog(
      userId,
      programId,
      dayId,
      payload
    );
    sendSuccess(res, result.data);
  }
);

const addWorkoutSet = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const workoutExerciseId = req.params.workoutExerciseId;
    const payload = req.body;

    const result = await workoutLogServices.addWorkoutSet(
      workoutExerciseId,
      payload
    );
    sendSuccess(res, result.data);
  }
);

const createManualWorkoutLog = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.params.userId;
    const programId = req.params.programId;
    const dayId = req.params.dayId;
    const payload = req.body;

    const result = await workoutLogServices.createManualWorkoutLog(
      userId,
      programId,
      dayId,
      payload
    );
    sendSuccess(res, result.data);
  }
);

const addManualWorkoutExercise = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const workoutLogId = req.params.workoutLogId;
    const programExerciseId = req.params.programExerciseId;
    const payload = req.body;

    const result = await workoutLogServices.addManualWorkoutExercise(
      workoutLogId,
      programExerciseId,
      payload
    );
    sendSuccess(res, result.data);
  }
);

const updateExerciseNotes = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const workoutExerciseId = req.params.workoutExerciseId;
    const exerciseNotes = req.body.exerciseNotes;

    const result = await workoutLogServices.updateExerciseNotes(
      workoutExerciseId,
      exerciseNotes
    );
    sendSuccess(res, result.data);
  }
);

const updateWorkoutLogName = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const workoutLogId = req.params.workoutLogId;
    const title = req.body.title;

    const result = await workoutLogServices.updateWorkoutLogName(
      workoutLogId,
      title
    );
    sendSuccess(res, result.data.message);
  }
);

const updateWorkoutLogStatus = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const workoutLogId = req.params.workoutLogId;
    const status = req.body.status;

    const result = await workoutLogServices.updateWorkoutLogStatus(
      workoutLogId,
      status
    );
    sendSuccess(res, result.data);
  }
);

const updateWorkoutSet = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const workoutSetId = req.params.workoutSetId;
    const workoutExerciseId = req.params.workoutExerciseId;
    const workoutSetPayload = req.body;

    const result = await workoutLogServices.updateWorkoutSet(
      workoutSetId,
      workoutExerciseId,
      workoutSetPayload
    );
    sendSuccess(res, result.data);
  }
);

const deleteWorkoutLog = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const workoutLogId = req.params.workoutLogId;

    const result = await workoutLogServices.deleteWorkoutLog(workoutLogId);
    sendSuccess(res, result.data.message);
  }
);

const deleteWorkoutSet = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const workoutSetId = req.params.workoutSetId;

    const result = await workoutLogServices.deleteWorkoutSet(workoutSetId);
    sendSuccess(res, result.data.message);
  }
);

const deleteWorkoutExercise = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const workoutExerciseId = req.params.workoutExerciseId;
    const workoutLogId = req.params.workoutLogId;
    const workoutLogType = req.params.workoutLogType;

    const result = await workoutLogServices.deleteWorkoutExercise(
      workoutExerciseId,
      workoutLogId,
      workoutLogType
    );
    sendSuccess(res, result.data.message);
  }
);

const deleteWorkoutSetWithCascade = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const workoutSetId = req.params.workoutSetId;
    const workoutExerciseId = req.params.workoutExerciseId;
    const workoutLogId = req.params.workoutLogId;

    const result = await workoutLogServices.deleteWorkoutSetWithCascade(
      workoutSetId,
      workoutExerciseId,
      workoutLogId
    );
    sendSuccess(res, result.data);
  }
);

export default {
  createWorkoutLog,
  getManualWorkoutLogWithPrevious,
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
  addWorkoutSet,
  deleteWorkoutSet,
  deleteWorkoutExercise,
};
