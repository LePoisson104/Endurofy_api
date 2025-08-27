import { body, param } from "express-validator";

const validateAddWater = [
  body("amount")
    .isFloat({ min: 0.01 })
    .withMessage("Amount must be a positive number"),
  body("unit").isIn(["ml", "floz"]).withMessage("Invalid unit"),
  body("log_date")
    .isISO8601()
    .withMessage("Log date must be a valid ISO 8601 date"),
];

const validateRemoveWater = [
  param("waterLogId")
    .isString()
    .notEmpty()
    .withMessage("Water log ID is required"),
];

const validateUpdateWater = [
  body("amount")
    .isFloat({ min: 0 })
    .withMessage("Amount must be a non-negative number"),
  body("unit").isIn(["ml", "floz"]).withMessage("Invalid unit"),
  body("log_date")
    .isISO8601()
    .withMessage("Log date must be a valid ISO 8601 date"),
];

const validateIncrementWater = [
  body("increment")
    .isFloat({ min: 0.01 })
    .withMessage("Increment must be a positive number"),
  body("unit").isIn(["ml", "floz"]).withMessage("Invalid unit"),
  body("log_date")
    .isISO8601()
    .withMessage("Log date must be a valid ISO 8601 date"),
];

export default {
  validateAddWater,
  validateRemoveWater,
  validateUpdateWater,
  validateIncrementWater,
};
