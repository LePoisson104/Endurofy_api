import express, { Router } from "express";
import { handleValidationErrors } from "../middlewares/error.handlers";
import verifyJWT from "../middlewares/verify.JWT";
import waterLogControllers from "../controllers/water-log.controllers";
import waterLogValidations from "../validations/water-log.validatons";

const router: Router = express.Router();

// router.use(verifyJWT);

router.get(
  "/:userId/date/:date",
  waterLogValidations.valdiateGetWaterLog,
  handleValidationErrors,
  waterLogControllers.getWaterLogByDate
);

router.post(
  "/:userId/date/:date",
  waterLogValidations.validateAddWater,
  handleValidationErrors,
  waterLogControllers.addWaterLog
);

router.patch(
  "/:waterLogId/:foodLogId",
  waterLogValidations.validateUpdateWater,
  handleValidationErrors,
  waterLogControllers.updateWaterLog
);

router.delete(
  "/:waterLogId/:foodLogId",
  waterLogValidations.validateRemoveWater,
  handleValidationErrors,
  waterLogControllers.deleteWaterLog
);

export default router;
