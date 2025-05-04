import express, { Router } from "express";
import { handleValidationErrors } from "../middlewares/error.handlers";
import workoutProgramControllers from "../controllers/workout-program.controllers";
import userValidation from "../validations/user.validation";
import verifyJWT from "../middlewares/verify.JWT";
import workoutProgramValidations from "../validations/workout-program.validations";

const router: Router = express.Router();

// router.use(verifyJWT);

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

router.delete(
  "/delete-workout-program/:userId/:programId",
  userValidation.validateUserId,
  workoutProgramValidations.validateProgramId,
  handleValidationErrors,
  workoutProgramControllers.deleteWorkoutProgram
);

export default router;
