import { body } from "express-validator";

const validateAddWater = [
  body("food_log_id")
    .optional()
    .isString()
    .withMessage("Food log id is required"),
  body("water_log_id")
    .optional()
    .isString()
    .withMessage("Water log id is required"),
  body("amount").isNumeric().withMessage("Amount is required"),
  body("unit").isIn(["ml", "floz"]).withMessage("Invalid unit"),
];

export default {
  validateAddWater,
};
