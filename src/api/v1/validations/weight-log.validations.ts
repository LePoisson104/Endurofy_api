import { body } from "express-validator";

const validateWeightLogPayload = [
  body("weight").isFloat({ min: 0 }).withMessage("Weight must be a number"),
  body("weight_unit")
    .isIn(["kg", "lb"])
    .withMessage("Weight unit must be either kg or lb"),
  body("calories_intake")
    .isFloat({ min: 0 })
    .withMessage("Calories intake must be a number"),
  body("date").isDate().withMessage("Date must be a valid date"),
];

export default {
  validateWeightLogPayload,
};
