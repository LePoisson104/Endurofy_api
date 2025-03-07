import { body } from "express-validator";

const validateUser = [
  body("email").isEmail().withMessage("Invalid email format"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 charaters long"),
];

export default validateUser;
