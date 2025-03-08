import { body } from "express-validator";

const validateUser = [
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

export default { validateUser };
