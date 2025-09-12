import express, { Router } from "express";
import { handleValidationErrors } from "../middlewares/error.handlers";
import workoutLogControllers from "../controllers/workout-log.controllers";
import userValidation from "../validations/user.validation";
import verifyJWT from "../middlewares/verify.JWT";
import workoutLogValidations from "../validations/workout-log.validations";

const router: Router = express.Router();

// router.use(verifyJWT);

router.get(
  "/get-weekly-sets/:userId/:programId/:startDate/:endDate",
  workoutLogValidations.validateGetWeeklySets,
  handleValidationErrors,
  workoutLogControllers.getWeeklySets
);

router.get(
  "/get-manual-workout-log-with-previous/:userId/:programId/:workoutDate",
  workoutLogValidations.validateGetManualWorkoutLogWithPrevious,
  handleValidationErrors,
  workoutLogControllers.getManualWorkoutLogWithPrevious
);

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
  workoutLogValidations.validateCreateManualWorkoutLogRequest,
  handleValidationErrors,
  workoutLogControllers.createManualWorkoutLog
);

router.post(
  "/add-manual-workout-exercise/:workoutLogId/:programExerciseId",
  workoutLogValidations.validateAddManualWorkoutExercise,
  handleValidationErrors,
  workoutLogControllers.addManualWorkoutExercise
);

router.post(
  "/add-workout-set/:workoutExerciseId",
  workoutLogValidations.validateAddWorkoutSet,
  handleValidationErrors,
  workoutLogControllers.addWorkoutSet
);

router.patch(
  "/update-workout-log-name/:workoutLogId",
  workoutLogValidations.validateUpdateWorkoutLogName,
  handleValidationErrors,
  workoutLogControllers.updateWorkoutLogName
);

router.patch(
  "/update-workout-log-status/:workoutLogId",
  workoutLogValidations.validateSetWorkoutLogStatus,
  handleValidationErrors,
  workoutLogControllers.updateWorkoutLogStatus
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

router.delete(
  "/delete-workout-set-with-cascade/:workoutSetId/:workoutExerciseId/:workoutLogId",
  workoutLogValidations.validateDeleteWorkoutSet,
  handleValidationErrors,
  workoutLogControllers.deleteWorkoutSetWithCascade
);

router.delete(
  "/delete-workout-log/:workoutLogId",
  workoutLogControllers.deleteWorkoutLog
);

router.delete(
  "/delete-workout-set/:workoutSetId",
  workoutLogControllers.deleteWorkoutSet
);

router.delete(
  "/delete-workout-exercise/:workoutExerciseId/:workoutLogId/:workoutLogType",
  workoutLogValidations.validateDeleteWorkoutExercise,
  handleValidationErrors,
  workoutLogControllers.deleteWorkoutExercise
);

export default router;
