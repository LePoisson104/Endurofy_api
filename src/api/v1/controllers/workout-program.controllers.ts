import { Request, Response, NextFunction } from "express";
import { sendSuccess } from "../utils/response.utils";
import {
  ExerciseRequest,
  WorkoutProgramRequest,
} from "../interfaces/workout-program.interface";
import workoutProgramServices from "../services/workout-program.services";
import { asyncHandler } from "../utils/async-handler";

const getWorkoutProgram = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.params.userId;

    const result = await workoutProgramServices.getAllWorkoutPrograms(userId);
    sendSuccess(res, result.data);
  }
);

const createManualWorkoutExercise = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const dayId = req.params.dayId;
    const exercise = req.body as ExerciseRequest;

    const result = await workoutProgramServices.createManualWorkoutExercise(
      dayId,
      exercise
    );
    sendSuccess(res, result);
  }
);

const createWorkoutProgram = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.params.userId;
    const workoutProgram = req.body as WorkoutProgramRequest;

    const result = await workoutProgramServices.createWorkoutProgram(
      userId,
      workoutProgram
    );

    sendSuccess(res, result);
  }
);

const addExercise = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const programId = req.params.programId;
    const dayId = req.params.dayId;
    const exercise = req.body;

    const result = await workoutProgramServices.addExercise(
      programId,
      dayId,
      exercise
    );
    sendSuccess(res, result);
  }
);

const addProgramDay = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const programId = req.params.programId;
    const payload = req.body;

    const result = await workoutProgramServices.addProgramDay(
      programId,
      payload
    );
    sendSuccess(res, result);
  }
);

const updateWorkoutProgramDescription = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.params.userId;
    const programId = req.params.programId;
    const payload = req.body;

    const result = await workoutProgramServices.updateWorkoutProgramDescription(
      userId,
      programId,
      payload
    );

    sendSuccess(res, result);
  }
);

const updateWorkoutProgramDay = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const programId = req.params.programId;
    const dayId = req.params.dayId;
    const payload = req.body;

    const result = await workoutProgramServices.updateWorkoutProgramDay(
      programId,
      dayId,
      payload
    );

    sendSuccess(res, result);
  }
);

const updateWorkoutProgramExercise = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const dayId = req.params.dayId;
    const exerciseId = req.params.exerciseId;
    const programId = req.params.programId;
    const payload = req.body;

    const result = await workoutProgramServices.updateWorkoutProgramExercise(
      dayId,
      exerciseId,
      programId,
      payload
    );

    sendSuccess(res, result);
  }
);

const setProgramAsActive = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.params.userId;
    const programId = req.params.programId;

    const result = await workoutProgramServices.setProgramAsActive(
      userId,
      programId
    );
    sendSuccess(res, result);
  }
);

const setProgramAsInactive = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.params.userId;
    const programId = req.params.programId;

    const result = await workoutProgramServices.setProgramAsInactive(
      userId,
      programId
    );
    sendSuccess(res, result);
  }
);

const reorderExerciseOrder = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const programId = req.params.programId;
    const dayId = req.params.dayId;
    const payload = req.body;

    const result = await workoutProgramServices.reorderExerciseOrder(
      programId,
      dayId,
      payload
    );

    sendSuccess(res, result);
  }
);

const deleteWorkoutProgram = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.params.userId;
    const programId = req.params.programId;

    const result = await workoutProgramServices.deleteWorkoutProgram(
      userId,
      programId
    );

    sendSuccess(res, result);
  }
);

const deleteManualWorkoutExercise = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const dayId = req.params.dayId;
    const exerciseId = req.params.exerciseId;

    const result = await workoutProgramServices.deleteManualWorkoutExercise(
      dayId,
      exerciseId
    );

    sendSuccess(res, result);
  }
);

const deleteWorkoutProgramDay = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const programId = req.params.programId;
    const dayId = req.params.dayId;

    const result = await workoutProgramServices.deleteWorkoutProgramDay(
      programId,
      dayId
    );

    sendSuccess(res, result);
  }
);

const deleteWorkoutProgramExercise = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const programId = req.params.programId;
    const dayId = req.params.dayId;
    const exerciseId = req.params.exerciseId;

    const result = await workoutProgramServices.deleteWorkoutProgramExercise(
      programId,
      dayId,
      exerciseId
    );

    sendSuccess(res, result);
  }
);

export default {
  createWorkoutProgram,
  getWorkoutProgram,
  deleteWorkoutProgram,
  updateWorkoutProgramDescription,
  updateWorkoutProgramDay,
  updateWorkoutProgramExercise,
  deleteWorkoutProgramDay,
  deleteWorkoutProgramExercise,
  deleteManualWorkoutExercise,
  addExercise,
  addProgramDay,
  reorderExerciseOrder,
  setProgramAsActive,
  setProgramAsInactive,
  createManualWorkoutExercise,
};
