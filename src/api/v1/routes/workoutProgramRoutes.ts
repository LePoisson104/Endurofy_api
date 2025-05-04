import express, { Router } from "express";
import { handleValidationErrors } from "../middlewares/error.handlers";
import workoutProgramControllers from "../controllers/workout-program.controllers";
import userValidation from "../validations/user.validation";
import verifyJWT from "../middlewares/verify.JWT";
import workoutProgramValidations from "../validations/workout-program.validations";

const router: Router = express.Router();

router.use(verifyJWT);

router.get(
  "/get-workout-program/:userId",
  userValidation.validateUserId,
  handleValidationErrors,
  workoutProgramControllers.getWorkoutProgram
);

router.post(
  "/create-workout-program/:userId",
  workoutProgramValidations.validateWorkoutProgramRequest,
  handleValidationErrors,
  workoutProgramControllers.createWorkoutProgram
);

router.patch(
  "/update-workout-program-description/:userId/:programId",
  workoutProgramValidations.validateProgramId,
  workoutProgramValidations.validateWorkoutProgramRequest,
  handleValidationErrors,
  workoutProgramControllers.updateWorkoutProgramDescription
);

router.patch(
  "/update-workout-program-day/:programId/:dayId",
  workoutProgramValidations.validateWorkoutProgramRequest,
  workoutProgramValidations.validateDayId,
  handleValidationErrors,
  workoutProgramControllers.updateWorkoutProgramDay
);

router.patch(
  "/update-workout-program-exercises/:dayId/:exerciseId",
  workoutProgramValidations.validateWorkoutProgramRequest,
  workoutProgramValidations.validateDayId,
  workoutProgramValidations.validateExerciseId,
  handleValidationErrors,
  workoutProgramControllers.updateWorkoutProgramExercises
);

router.delete(
  "/delete-workout-program/:userId/:programId",
  userValidation.validateUserId,
  workoutProgramValidations.validateProgramId,
  handleValidationErrors,
  workoutProgramControllers.deleteWorkoutProgram
);

router.delete(
  "/delete-workout-program-day/:programId/:dayId",
  workoutProgramValidations.validateProgramId,
  workoutProgramValidations.validateDayId,
  handleValidationErrors,
  workoutProgramControllers.deleteWorkoutProgramDay
);

router.delete(
  "/delete-workout-program-exercise/:dayId/:exerciseId",
  workoutProgramValidations.validateDayId,
  workoutProgramValidations.validateExerciseId,
  handleValidationErrors,
  workoutProgramControllers.deleteWorkoutProgramExercise
);

export default router;
