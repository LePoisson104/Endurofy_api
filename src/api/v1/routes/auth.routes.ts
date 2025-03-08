import express, { Router } from "express";
import authControllers from "../controllers/auth.controllers";
import limiters from "../middlewares/limiters";
import userValidation from "../validations/user.validation";
import { handleValidationErrors } from "../middlewares/error.handlers";

const router: Router = express.Router();

router
  .route("/signup")
  .post(
    limiters.signupLimiter,
    userValidation.validateUser,
    handleValidationErrors,
    authControllers.signup
  );

export default router;
