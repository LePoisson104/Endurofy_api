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
  body("birth_date").isDate().withMessage("Invalid birth date format").trim(),
  body("gender").isIn(["male", "female"]).withMessage("Invalid gender").trim(),
  body("height")
    .isInt({ min: 0 })
    .withMessage("Height must be a positive integer")
    .trim(),
  body("height_unit")
    .isIn(["cm", "ft"])
    .withMessage("Invalid height unit")
    .trim(),
  body("starting_weight")
    .isFloat({ min: 0 })
    .withMessage("Weight must be a positive number")
    .trim(),
  body("starting_weight_unit")
    .isIn(["kg", "lb"])
    .withMessage("Invalid starting weight unit")
    .trim(),
  body("current_weight")
    .isFloat({ min: 0 })
    .withMessage("Weight must be a positive number")
    .trim(),
  body("current_weight_unit")
    .isIn(["kg", "lb"])
    .withMessage("Invalid current weight unit")
    .trim(),
  body("weight_goal")
    .isFloat({ min: 0 })
    .withMessage("Weight goal must be a positive number")
    .trim(),
  body("weight_goal_unit")
    .isIn(["kg", "lb"])
    .withMessage("Invalid weight goal unit")
    .trim(),
  body("goal")
    .isIn(["lose", "gain", "maintain"])
    .withMessage("Invalid goal type")
    .trim(),
  body("activity_level")
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
    .withMessage("Invalid profile status"),
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
