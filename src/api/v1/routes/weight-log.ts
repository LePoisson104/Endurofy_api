import express, { Router } from "express";
import weightLogValidation from "../validations/weight-log.validations";
import userValidation from "../validations/user.validation";
import { handleValidationErrors } from "../middlewares/error.handlers";
import weightLogControllers from "../controllers/weight-log.controllers";
import verifyJWT from "../middlewares/verify.JWT";

const router: Router = express.Router();

// router.use(verifyJWT);

router.post(
  "/create-weight-log/:userId",
  userValidation.validateUserId,
  weightLogValidation.validateWeightLogPayload,
  handleValidationErrors,
  weightLogControllers.createWeightLog
);

export default router;
