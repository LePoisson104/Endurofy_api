import { Request, Response, NextFunction } from "express";
import { controllerErrorResponse } from "../middlewares/error.handlers";
import { CustomError } from "../interfaces/error.interface";
import { sendSuccess } from "../utils/response.utils";
import { WorkoutProgramRequest } from "../interfaces/workout-program.interface";

const createWorkoutProgram = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const userId = req.params.userId;
  const workoutProgram = req.body as WorkoutProgramRequest;

  console.log(workoutProgram);
  res.json({
    message: "Workout program created successfully",
  });
  //   try {
  //   } catch (err) {
  //     controllerErrorResponse(res, err as CustomError);
  //   }
};

export default {
  createWorkoutProgram,
};
