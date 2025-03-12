import express, { Router } from "express";
import userValidation from "../validations/user.validation";
import { handleValidationErrors } from "../middlewares/error.handlers";
import userControllers from "../controllers/users.controllers";
import verifyJWT from "../middlewares/verify.JWT";

const router: Router = express.Router();

// router.use(verifyJWT);

router.get(
  "/:userId",
  userValidation.validateUserId,
  handleValidationErrors,
  userControllers.getUsersInfo
);
router.post(
  "/delete-account/:userId",
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

export default router;
