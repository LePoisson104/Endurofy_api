import express, { Router } from "express";
import userValidation from "../validations/user.validation";
import { handleValidationErrors } from "../middlewares/error.handlers";
import userControllers from "../controllers/users.controllers";
import verifyJWT from "../middlewares/verify.JWT";
import limiters from "../middlewares/limiters";

const router: Router = express.Router();

router.use(verifyJWT);

router.get(
  "/:userId",
  userValidation.validateUserId,
  handleValidationErrors,
  userControllers.getUsersInfo
);
router.delete(
  "/delete-account/:userId",
  limiters.deleteAccountAttemptLimiter,
  userValidation.validateDeleteAccount,
  handleValidationErrors,
  userControllers.deleteAccount
);
router.patch(
  "/update-name/:userId",
  userValidation.validateUserId,
  userValidation.validateUserUpdateName,
  handleValidationErrors,
  userControllers.updateUsersName
);
router.patch(
  "/update-password/:userId",
  userValidation.validateUserId,
  userValidation.validateUsersEmail,
  userValidation.validateUserUpdatePassword,
  handleValidationErrors,
  userControllers.updateUsersPassword
);

router.patch(
  "/update-email/:userId",
  userValidation.validateUserUpdateEmail,
  handleValidationErrors,
  userControllers.updateUsersEmail
);

router.post(
  "/verify-update-email/:userId",
  userValidation.validateVerifyUpdateEmail,
  handleValidationErrors,
  userControllers.verifyUpdateEmail
);

router.patch(
  "/update-profile/:userId",
  userValidation.validateUserUpdateProfile,
  handleValidationErrors,
  userControllers.updateUsersProfile
);

export default router;
