import express, { Router } from "express";
import weightLogValidation from "../validations/weight-log.validations";
import { handleValidationErrors } from "../middlewares/error.handlers";
import weightLogControllers from "../controllers/weight-log.controllers";
import verifyJWT from "../middlewares/verify.JWT";

const router: Router = express.Router();

router.use(verifyJWT);

router.get(
  "/get-weight-log-by-date",
  weightLogValidation.validateGetWeightLogByDate,
  handleValidationErrors,
  weightLogControllers.getWeightLogByDate
);

router.get(
  "/get-weight-log-dates-by-range",
  weightLogValidation.validateGetWeightLogDatesByRange,
  handleValidationErrors,
  weightLogControllers.getWeightLogDatesByRange
);

router.get(
  "/get-weekly-weight-difference",
  weightLogControllers.getWeeklyWeightDifference
);

router.post(
  "/create-weight-log",
  weightLogValidation.validateWeightLogPayload,
  handleValidationErrors,
  weightLogControllers.createWeightLog
);

router.patch(
  "/update-weight-log/:weightLogId",
  weightLogValidation.validateWeightLogId,
  handleValidationErrors,
  weightLogControllers.updateWeightLog
);

router.delete(
  "/delete-weight-log/:weightLogId",
  weightLogValidation.validateWeightLogId,
  handleValidationErrors,
  weightLogControllers.deleteWeightLog
);

export default router;
