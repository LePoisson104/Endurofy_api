import { Request, Response, NextFunction } from "express";
import { sendSuccess } from "../utils/response.utils";
import workoutProgressionServices from "../services/workout-progression.services";
import { asyncHandler } from "../utils/async-handler";
import { AuthenticatedRequest } from "../interfaces/request.interfaces";

const getPersonalRecord = asyncHandler(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const userId = req.userId;
    const programId = req.params.programId;
    const programExerciseId = req.params.programExerciseId;

    const result = await workoutProgressionServices.getPersonalRecord(
      userId,
      programId,
      programExerciseId
    );
    sendSuccess(res, result);
  }
);

const getAnalytics = asyncHandler(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const userId = req.userId;
    const programId = req.params.programId;
    const programExerciseId = req.params.programExerciseId;
    const startDate = req.params.startDate;
    const endDate = req.params.endDate;

    const result = await workoutProgressionServices.getAnalyticsData(
      userId,
      programId,
      programExerciseId,
      startDate,
      endDate
    );
    sendSuccess(res, result.data);
  }
);

export default {
  getAnalytics,
  getPersonalRecord,
};
