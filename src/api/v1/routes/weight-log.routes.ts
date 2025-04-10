import express, { Router } from "express";
import weightLogValidation from "../validations/weight-log.validations";
import userValidation from "../validations/user.validation";
import { handleValidationErrors } from "../middlewares/error.handlers";
import weightLogControllers from "../controllers/weight-log.controllers";
import verifyJWT from "../middlewares/verify.JWT";

const router: Router = express.Router();

// router.use(verifyJWT);

router.get(
  "/get-weight-log-by-date/:userId",
  userValidation.validateUserId,
  weightLogValidation.validateGetWeightLogByDate,
  handleValidationErrors,
  weightLogControllers.getWeightLogByDate
);

router.get(
  "/get-weekly-weight-difference/:userId",
  userValidation.validateUserId,
  handleValidationErrors,
  weightLogControllers.getWeeklyWeightDifference
);

router.post(
  "/create-weight-log/:userId",
  userValidation.validateUserId,
  weightLogValidation.validateWeightLogPayload,
  handleValidationErrors,
  weightLogControllers.createWeightLog
);

router.patch(
  "/update-weight-log/:userId/:weightLogId",
  userValidation.validateUserId,
  weightLogValidation.validateWeightLogId,
  handleValidationErrors,
  weightLogControllers.updateWeightLog
);

router.delete(
  "/delete-weight-log/:userId/:weightLogId",
  userValidation.validateUserId,
  weightLogValidation.validateWeightLogId,
  handleValidationErrors,
  weightLogControllers.deleteWeightLog
);

export default router;
