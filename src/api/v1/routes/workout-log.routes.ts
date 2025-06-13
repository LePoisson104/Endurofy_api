import express, { Router } from "express";
import { handleValidationErrors } from "../middlewares/error.handlers";
import workoutLogControllers from "../controllers/workout-log.controllers";
import userValidation from "../validations/user.validation";
import verifyJWT from "../middlewares/verify.JWT";
import workoutProgramValidations from "../validations/workout-program.validations";
import workoutLogValidations from "../validations/workout-log.validations";

const router: Router = express.Router();

router.use(verifyJWT);

router.get(
  "/get-workout-log/:userId/:programId/:startDate/:endDate",
  workoutLogValidations.validateGetWorkoutLogByDate,
  handleValidationErrors,
  workoutLogControllers.getWorkoutLogByDate
);

router.post(
  "/create-workout-log/:userId/:programId",
  userValidation.validateUserId,
  workoutProgramValidations.validateProgramId,
  workoutLogValidations.validateCreateWorkoutLogRequest,
  handleValidationErrors,
  workoutLogControllers.createWorkoutLog
);

router.delete(
  "/delete-workout-set/:workoutSetId/:workoutExerciseId/:workoutLogId",
  workoutLogValidations.validateDeleteWorkoutSet,
  handleValidationErrors,
  workoutLogControllers.deleteWorkoutSetWithCascade
);

router.patch(
  "/update-exercise-notes/:workoutExerciseId",
  workoutLogValidations.validateAddExerciseNote,
  handleValidationErrors,
  workoutLogControllers.updateExerciseNotes
);

export default router;
