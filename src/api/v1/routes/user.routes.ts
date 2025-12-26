import express, { Router } from "express";
import userValidation from "../validations/user.validation";
import { handleValidationErrors } from "../middlewares/error.handlers";
import userControllers from "../controllers/users.controllers";
import verifyJWT from "../middlewares/verify.JWT";
import limiters from "../middlewares/limiters";

const router: Router = express.Router();

router.use(verifyJWT);

router.get("/", userControllers.getUsersInfo);
router.get("/macros-goals/", userControllers.getUsersMacrosGoals);
router.delete(
  "/delete-account/",
  limiters.deleteAccountAttemptLimiter,
  userValidation.validateDeleteAccount,
  handleValidationErrors,
  userControllers.deleteAccount
);
router.patch(
  "/update-name/",
  userValidation.validateUserUpdateName,
  handleValidationErrors,
  userControllers.updateUsersName
);
router.patch(
  "/update-password/",
  userValidation.validateUsersEmail,
  userValidation.validateUserUpdatePassword,
  handleValidationErrors,
  userControllers.updateUsersPassword
);
router.patch(
  "/macros-goals/",
  userValidation.validateUserUpdateMacrosGoals,
  handleValidationErrors,
  userControllers.updateUsersMacrosGoals
);
router.patch(
  "/update-email/",
  userValidation.validateUserUpdateEmail,
  handleValidationErrors,
  userControllers.updateUsersEmail
);

router.post(
  "/verify-update-email/",
  userValidation.validateVerifyUpdateEmail,
  handleValidationErrors,
  userControllers.verifyUpdateEmail
);

router.patch(
  "/update-profile/",
  userValidation.validateUserUpdateProfile,
  handleValidationErrors,
  userControllers.updateUsersProfile
);

router.patch(
  "/update-profile-and-convert-weight-logs/",
  userValidation.validateUserUpdateProfile,
  handleValidationErrors,
  userControllers.updateUsersProfileAndConvertWeightLogs
);

export default router;
