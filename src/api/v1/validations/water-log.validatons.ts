import { body, param } from "express-validator";

const valdiateGetWaterLog = [
  param("userId").isString().notEmpty().withMessage("User id is required"),
  param("date")
    .notEmpty()
    .withMessage("Date is required")
    .isISO8601()
    .withMessage("Date must be a valid date in YYYY-MM-DD format"),
];

const validateAddWater = [
  param("userId").isString().notEmpty().withMessage("User id is required"),
  body("amount")
    .isFloat({ min: 0.01 })
    .withMessage("Amount must be a positive number"),
  body("unit").isIn(["ml", "floz"]).withMessage("Invalid unit"),
  param("date")
    .notEmpty()
    .withMessage("Date is required")
    .isISO8601()
    .withMessage("Date must be a valid date in YYYY-MM-DD format"),
];

const validateUpdateWater = [
  param("waterLogId")
    .isUUID()
    .withMessage("Invalid water log id")
    .isString()
    .notEmpty()
    .withMessage("Water log ID is required"),
  param("foodLogId")
    .isUUID()
    .withMessage("Invalid water log id")
    .isString()
    .notEmpty()
    .withMessage("Water log ID is required"),
  body("amount")
    .isFloat({ min: 0 })
    .withMessage("Amount must be a non-negative number"),
];

const validateRemoveWater = [
  param("waterLogId")
    .isUUID()
    .withMessage("Invalid water log id")
    .isString()
    .notEmpty()
    .withMessage("Water log ID is required"),
  param("foodLogId")
    .isUUID()
    .withMessage("Invalid water log id")
    .isString()
    .notEmpty()
    .withMessage("Water log ID is required"),
];

export default {
  validateAddWater,
  validateRemoveWater,
  validateUpdateWater,
  valdiateGetWaterLog,
};
