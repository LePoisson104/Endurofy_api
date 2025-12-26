import express, { Router } from "express";
import { handleValidationErrors } from "../middlewares/error.handlers";
import workoutProgressionControllers from "../controllers/workout-progression.controllers";
import verifyJWT from "../middlewares/verify.JWT";
import workoutProgressionValidation from "../validations/workout-progression.validation";

const router: Router = express.Router();

router.use(verifyJWT);

router.get(
  "/personal-record/:programId/:programExerciseId",
  workoutProgressionControllers.getPersonalRecord
);

router.get(
  "/analytics/:programId/:programExerciseId/:startDate/:endDate",
  workoutProgressionValidation.validateGetWorkoutProgressionAnalytics,
  handleValidationErrors,
  workoutProgressionControllers.getAnalytics
);

export default router;
