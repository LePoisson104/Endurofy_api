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
    userValidation.validateUserSignup,
    handleValidationErrors,
    authControllers.signup
  );
router
  .route("/verify-otp/:userId")
  .post(
    limiters.otpLimiter,
    userValidation.validateOTPVerification,
    handleValidationErrors,
    authControllers.verifyOTP
  );
router
  .route("/resend-otp/:userId")
  .post(
    limiters.otpLimiter,
    userValidation.validateUsersEmail,
    userValidation.validateUserId,
    handleValidationErrors,
    authControllers.resendOTP
  );
router
  .route("/login")
  .post(
    limiters.loginLimiter,
    userValidation.validateUserLogin,
    handleValidationErrors,
    authControllers.login
  );
router.route("/refresh").get(authControllers.refresh);
router.route("/logout").post(authControllers.logout);

export default router;
