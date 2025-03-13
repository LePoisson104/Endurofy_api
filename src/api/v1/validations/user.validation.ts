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

const validateUserUpdateEmail = [
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
  body("newEmail")
    .notEmpty()
    .withMessage(ERROR_MESSAGES.REQUIRED_FIELD("New email"))
    .isEmail()
    .withMessage(ERROR_MESSAGES.INVALID_EMAIL)
    .normalizeEmail()
    .trim(),
  body("password")
    .notEmpty()
    .withMessage(ERROR_MESSAGES.REQUIRED_FIELD("Password"))
    .trim(),
];

const validateVerifyUpdateEmail = [
  param("userId")
    .isUUID()
    .withMessage("Invalid userId format")
    .notEmpty()
    .withMessage(ERROR_MESSAGES.REQUIRED_FIELD("UserId")),
  body("otp")
    .notEmpty()
    .withMessage(ERROR_MESSAGES.REQUIRED_FIELD("OTP"))
    .isLength({ min: OTP_LENGTH, max: OTP_LENGTH })
    .withMessage(ERROR_MESSAGES.INVALID_OTP)
    .matches(/^\d+$/)
    .withMessage("OTP must contain only numbers")
    .trim(),
];

const validateUserUpdateProfile = [
  param("userId")
    .isUUID()
    .withMessage("Invalid userId format")
    .notEmpty()
    .withMessage(ERROR_MESSAGES.REQUIRED_FIELD("UserId")),
  body("birth_date")
    .optional()
    .isDate()
    .withMessage("Invalid birth date format")
    .trim(),
  body("gender")
    .optional()
    .isIn(["male", "female"])
    .withMessage("Invalid gender")
    .trim(),
  body("weight")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Weight must be a positive number")
    .trim(),
  body("height")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Height must be a positive integer")
    .trim(),
  body("weight_unit")
    .optional()
    .isIn(["kg", "lb"])
    .withMessage("Invalid weight unit")
    .trim(),
  body("height_unit")
    .optional()
    .isIn(["cm", "ft"])
    .withMessage("Invalid height unit")
    .trim(),
  body("weight_goal")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Weight goal must be a positive number")
    .trim(),
  body("weight_goal_unit")
    .optional()
    .isIn(["kg", "lb"])
    .withMessage("Invalid weight goal unit")
    .trim(),
  body("goal")
    .optional()
    .isIn(["lose", "gain", "maintain"])
    .withMessage("Invalid goal type")
    .trim(),
  body("activity_level")
    .optional()
    .isIn([
      "sedentary",
      "lightly_active",
      "moderately_active",
      "very_active",
      "extra_active",
    ])
    .withMessage("Invalid activity level")
    .trim(),
  body("profile_status")
    .isIn(["complete", "incomplete"])
    .withMessage("Invalid profile status")
    .trim(),
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
  validateUserUpdateEmail,
  validateVerifyUpdateEmail,
  validateUserUpdateProfile,
};
