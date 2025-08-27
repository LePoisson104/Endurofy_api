import express, { Router } from "express";
import { handleValidationErrors } from "../middlewares/error.handlers";
import verifyJWT from "../middlewares/verify.JWT";
import waterLogControllers from "../controllers/water-log.controllers";
import waterLogValidations from "../validations/water-log.validatons";

const router: Router = express.Router();

// router.use(verifyJWT);

router.post(
  "/",
  waterLogValidations.validateAddWater,
  handleValidationErrors,
  waterLogControllers.addWater
);

export default router;
