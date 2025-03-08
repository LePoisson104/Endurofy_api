import { body, param } from "express-validator";

const validateUserSignup = [
  body("firstName")
    .notEmpty()
    .withMessage("First name is required")
    .isString()
    .withMessage("First name must be a string"),
  body("lastName")
    .notEmpty()
    .withMessage("Last name is required")
    .isString()
    .withMessage("Last name must be a string"),
  body("email")
    .isEmail()
    .withMessage("Invalid email format")
    .isString()
    .withMessage("Email must be a string"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 charaters long")
    .isString()
    .withMessage("Password must be a string"),
];

const validateUserLogin = [
  body("email")
    .notEmpty()
    .withMessage("Email is required!")
    .isEmail()
    .withMessage("Invalid email address"),
  body("password").notEmpty().withMessage("Password is required!"),
];

const validateUserId = [
  param("userId") // Using `param` if `userId` is part of the URL parameters
    .isUUID()
    .withMessage("Invalid userId format")
    .notEmpty()
    .withMessage("UserId is required"),
];

export default { validateUserSignup, validateUserLogin, validateUserId };
