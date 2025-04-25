import express, { Router } from "express";
import { handleValidationErrors } from "../middlewares/error.handlers";
import workoutProgramControllers from "../controllers/workout-program.controllers";
import verifyJWT from "../middlewares/verify.JWT";
import workoutProgramValidations from "../validations/workout-program.validations";

const router: Router = express.Router();

// router.use(verifyJWT);

router.post(
  "/create-workout-program/:userId",
  workoutProgramValidations.validateWorkoutProgramRequest,
  handleValidationErrors,
  workoutProgramControllers.createWorkoutProgram
);

export default router;
