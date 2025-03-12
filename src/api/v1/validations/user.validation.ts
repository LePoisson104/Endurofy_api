import { body, param } from "express-validator";
import {
  OTP_LENGTH,
  MIN_PASSWORD_LENGTH,
  ERROR_MESSAGES,
} from "../constants/validation.constants";

const validateUserSignup = [
  body("firstName")
    .notEmpty()
    .withMessage(ERROR_MESSAGES.REQUIRED_FIELD("First name"))
    .isString()
    .withMessage("First name must be a string")
    .trim()
    .escape(),
  body("lastName")
    .notEmpty()
    .withMessage(ERROR_MESSAGES.REQUIRED_FIELD("Last name"))
    .isString()
    .withMessage("Last name must be a string")
    .trim()
    .escape(),
  body("email")
    .notEmpty()
    .withMessage(ERROR_MESSAGES.REQUIRED_FIELD("Email"))
    .isEmail()
    .withMessage(ERROR_MESSAGES.INVALID_EMAIL)
    .normalizeEmail()
    .trim(),
  body("password")
    .isLength({ min: MIN_PASSWORD_LENGTH })
    .withMessage(
      `Password must be at least ${MIN_PASSWORD_LENGTH} characters long`
    )
    .trim(),
];

const validateUserLogin = [
  body("email")
    .notEmpty()
    .withMessage(ERROR_MESSAGES.REQUIRED_FIELD("Email"))
    .isEmail()
    .withMessage(ERROR_MESSAGES.INVALID_EMAIL)
    .normalizeEmail()
    .trim(),
  body("password")
    .notEmpty()
    .withMessage(ERROR_MESSAGES.REQUIRED_FIELD("Password"))
    .trim(),
];

const validateUserId = [
  param("userId")
    .isUUID()
    .withMessage("Invalid userId format")
    .notEmpty()
    .withMessage(ERROR_MESSAGES.REQUIRED_FIELD("UserId")),
];

const validateDeleteAccount = [
  param("userId")
    .isUUID()
    .withMessage("Invalid userId format")
    .notEmpty()
    .withMessage(ERROR_MESSAGES.REQUIRED_FIELD("UserId")),
  body("email")
    .notEmpty()
    .withMessage(ERROR_MESSAGES.REQUIRED_FIELD("Email"))
    .isEmail()
    .withMessage(ERROR_MESSAGES.INVALID_EMAIL)
    .normalizeEmail()
    .trim(),
  body("password")
    .notEmpty()
    .withMessage(ERROR_MESSAGES.REQUIRED_FIELD("Password"))
    .trim(),
];

const validateOTPVerification = [
  body("email")
    .notEmpty()
    .withMessage(ERROR_MESSAGES.REQUIRED_FIELD("Email"))
    .isEmail()
    .withMessage(ERROR_MESSAGES.INVALID_EMAIL)
    .normalizeEmail()
    .trim(),
  body("otp")
    .notEmpty()
    .withMessage(ERROR_MESSAGES.REQUIRED_FIELD("OTP"))
    .isLength({ min: OTP_LENGTH, max: OTP_LENGTH })
    .withMessage(ERROR_MESSAGES.INVALID_OTP)
    .matches(/^\d+$/)
    .withMessage("OTP must contain only numbers")
    .trim(),
];

const validateUsersEmail = [
  body("email")
    .notEmpty()
    .withMessage(ERROR_MESSAGES.REQUIRED_FIELD("Email"))
    .isEmail()
    .withMessage(ERROR_MESSAGES.INVALID_EMAIL)
    .normalizeEmail()
    .trim(),
  body("newEmail")
    .optional()
    .notEmpty()
    .withMessage(ERROR_MESSAGES.REQUIRED_FIELD("New email"))
    .isEmail()
    .withMessage(ERROR_MESSAGES.INVALID_EMAIL)
    .normalizeEmail()
    .trim(),
];

const validateUserUpdatePassword = [
  body("password")
    .notEmpty()
    .withMessage(ERROR_MESSAGES.REQUIRED_FIELD("Password"))
    .trim(),
  body("newPassword")
    .notEmpty()
    .withMessage(ERROR_MESSAGES.REQUIRED_FIELD("New password"))
    .isLength({ min: MIN_PASSWORD_LENGTH })
    .withMessage(
      `Password must be at least ${MIN_PASSWORD_LENGTH} characters long`
    )
    .trim(),
];

const validateUserUpdateName = [
  body("firstName")
    .notEmpty()
    .withMessage(ERROR_MESSAGES.REQUIRED_FIELD("First name"))
    .isString()
    .withMessage("First name must be a string")
    .trim()
    .escape(),
  body("lastName")
    .notEmpty()
    .withMessage(ERROR_MESSAGES.REQUIRED_FIELD("Last name"))
    .isString()
    .withMessage("Last name must be a string")
    .trim()
    .escape(),
];

export default {
  validateUserSignup,
  validateUserLogin,
  validateUserId,
  validateOTPVerification,
  validateUsersEmail,
  validateDeleteAccount,
  validateUserUpdatePassword,
  validateUserUpdateName,
};
