import express, { Router } from "express";
import { handleValidationErrors } from "../middlewares/error.handlers";
import workoutLogControllers from "../controllers/workout-log.controllers";
import userValidation from "../validations/user.validation";
import verifyJWT from "../middlewares/verify.JWT";
import workoutLogValidations from "../validations/workout-log.validations";

const router: Router = express.Router();

router.use(verifyJWT);

router.get(
  "/get-workout-log-pagination/:userId/:programId/:offset/:limit",
  workoutLogValidations.validateGetWorkoutLogPagination,
  handleValidationErrors,
  workoutLogControllers.getWorkoutLogPagination
);

router.get(
  "/get-previous-workout-log/:userId/:programId/:dayId/:currentWorkoutDate",
  workoutLogValidations.validateGetPreviousWorkoutLog,
  handleValidationErrors,
  workoutLogControllers.getPreviousWorkoutLog
);

router.get(
  "/get-workout-log/:userId/:programId/:startDate/:endDate",
  workoutLogValidations.validateGetWorkoutLogByDate,
  handleValidationErrors,
  workoutLogControllers.getWorkoutLogByDate
);

router.get(
  "/get-workout-log-dates/:userId/:programId/:startDate/:endDate",
  workoutLogValidations.validateGetWorkoutLogByDate,
  handleValidationErrors,
  workoutLogControllers.getWorkoutLogDates
);

router.get(
  "/get-completed-workout-logs/:userId/:programId/:startDate/:endDate",
  workoutLogValidations.validateGetCompletedWorkoutLogs,
  handleValidationErrors,
  workoutLogControllers.getCompletedWorkoutLogs
);

router.post(
  "/create-workout-log/:userId/:programId/:dayId",
  userValidation.validateUserId,
  workoutLogValidations.validateCreateWorkoutLogRequest,
  handleValidationErrors,
  workoutLogControllers.createWorkoutLog
);

router.post(
  "/create-manual-workout-log/:userId/:programId/:dayId",
  userValidation.validateUserId,
  handleValidationErrors,
  workoutLogControllers.createManualWorkoutLog
);

router.patch(
  "/update-workout-log-status/:workoutLogId",
  workoutLogValidations.validateSetWorkoutLogStatus,
  handleValidationErrors,
  workoutLogControllers.updateWorkoutLogStatus
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

router.patch(
  "/update-workout-set/:workoutSetId/:workoutExerciseId",
  workoutLogValidations.validateUpdateWorkoutSet,
  handleValidationErrors,
  workoutLogControllers.updateWorkoutSet
);

export default router;
