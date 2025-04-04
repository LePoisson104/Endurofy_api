import { body, query } from "express-validator";

const validateWeightLogPayload = [
  body("weight")
    .notEmpty()
    .withMessage("Weight is required!")
    .isFloat({ min: 0 })
    .withMessage("Weight must be a number"),
  body("weightUnit")
    .notEmpty()
    .withMessage("Weight unit is required!")
    .isIn(["kg", "lb"])
    .withMessage("Weight unit must be either kg or lb"),
  body("caloriesIntake")
    .notEmpty()
    .withMessage("Calories intake is required!")
    .isFloat({ min: 0 })
    .withMessage("Calories intake must be a number"),
  body("date")
    .notEmpty()
    .withMessage("Date is required!")
    .isDate()
    .withMessage("Date must be a valid date"),
];

const validateGetWeightLogByDate = [
  query("startDate")
    .notEmpty()
    .withMessage("Start date is required!")
    .isDate()
    .withMessage("Start date must be a valid date"),
  query("endDate")
    .notEmpty()
    .withMessage("End date is required!")
    .isDate()
    .withMessage("End date must be a valid date"),
];

export default {
  validateWeightLogPayload,
  validateGetWeightLogByDate,
};
