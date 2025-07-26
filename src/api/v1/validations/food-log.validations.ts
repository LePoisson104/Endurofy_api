import { body, param } from "express-validator";

const validateGetFoodLogByDate = [
  param("date")
    .notEmpty()
    .withMessage("Date is required")
    .isISO8601()
    .withMessage("Date must be a valid date in YYYY-MM-DD format"),
];

const validateGetLogDates = [
  param("startDate")
    .notEmpty()
    .withMessage("Start date is required")
    .isISO8601()
    .withMessage("Start date must be a valid date in YYYY-MM-DD format"),
  param("endDate")
    .notEmpty()
    .withMessage("End date is required")
    .isISO8601()
    .withMessage("End date must be a valid date in YYYY-MM-DD format"),
];

const validateAddFood = [
  body("foodName")
    .notEmpty()
    .withMessage("Food name is required")
    .isString()
    .withMessage("Food name must be a string"),
  body("foodBrand")
    .notEmpty()
    .withMessage("Food brand is required")
    .isString()
    .withMessage("Food brand must be a string"),
  body("foodSource")
    .notEmpty()
    .withMessage("Food source is required")
    .isIn(["USDA", "custom"])
    .withMessage("Food source must be either 'USDA' or 'custom'"),
  body("calories")
    .notEmpty()
    .withMessage("Calories is required")
    .isFloat({ min: 0 })
    .withMessage("Calories must be a number greater than or equal to 0"),
  body("protein")
    .notEmpty()
    .withMessage("Protein is required")
    .isFloat({ min: 0 })
    .withMessage("Protein must be a number greater than or equal to 0"),
  body("carbs")
    .notEmpty()
    .withMessage("Carbs is required")
    .isFloat({ min: 0 })
    .withMessage("Carbs must be a number greater than or equal to 0"),
  body("fat")
    .notEmpty()
    .withMessage("Fat is required")
    .isFloat({ min: 0 })
    .withMessage("Fat must be a number greater than or equal to 0"),
  body("fiber")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Fiber must be a number greater than or equal to 0"),
  body("sugar")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Sugar must be a number greater than or equal to 0"),
  body("sodium")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Sodium must be a number greater than or equal to 0"),
  body("cholesterol")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Cholesterol must be a number greater than or equal to 0"),
  body("servingSize")
    .notEmpty()
    .withMessage("Serving size is required")
    .isFloat({ min: 0.1 })
    .withMessage("Serving size must be a number greater than 0"),
  body("servingUnit")
    .notEmpty()
    .withMessage("Serving unit is required")
    .isIn(["g", "ml", "oz"])
    .withMessage("Serving unit must be either 'g', 'ml', or 'oz'"),
  body("mealType")
    .notEmpty()
    .withMessage("Meal type is required")
    .isIn(["breakfast", "lunch", "dinner", "snacks", "uncategorized"])
    .withMessage(
      "Meal type must be one of: breakfast, lunch, dinner, snacks, uncategorized"
    ),
  body("loggedAt")
    .notEmpty()
    .withMessage("Logged at date is required")
    .isISO8601()
    .withMessage("Logged at must be a valid date in YYYY-MM-DD format"),
  body("foodId")
    .notEmpty()
    .withMessage("Food ID is required")
    .isString()
    .withMessage("Food ID must be a string"),
];

const validateUpdateFood = [
  param("foodId")
    .notEmpty()
    .withMessage("Food ID is required")
    .isUUID()
    .withMessage("Invalid food ID format"),
  body("serving_size")
    .notEmpty()
    .withMessage("Serving size is required")
    .isFloat({ min: 0.1 })
    .withMessage("Serving size must be a number greater than 0"),
  body("serving_unit")
    .notEmpty()
    .withMessage("Serving unit is required")
    .isIn(["g", "ml", "oz"])
    .withMessage("Serving unit must be either 'g', 'ml', or 'oz'"),
];

const validateUpdateCustomFood = [
  param("customFoodId")
    .notEmpty()
    .withMessage("Custom food ID is required")
    .isUUID()
    .withMessage("Invalid custom food ID format"),
  body("food_name")
    .notEmpty()
    .withMessage("Food name is required")
    .isString()
    .withMessage("Food name must be a string"),
  body("food_brand")
    .notEmpty()
    .withMessage("Food brand is required")
    .isString()
    .withMessage("Food brand must be a string"),
  body("calories")
    .notEmpty()
    .withMessage("Calories is required")
    .isFloat({ min: 0 })
    .withMessage("Calories must be a number greater than or equal to 0"),
  body("protein")
    .notEmpty()
    .withMessage("Protein is required")
    .isFloat({ min: 0 })
    .withMessage("Protein must be a number greater than or equal to 0"),
  body("carbs")
    .notEmpty()
    .withMessage("Carbs is required")
    .isFloat({ min: 0 })
    .withMessage("Carbs must be a number greater than or equal to 0"),
  body("fat")
    .notEmpty()
    .withMessage("Fat is required")
    .isFloat({ min: 0 })
    .withMessage("Fat must be a number greater than or equal to 0"),
  body("serving_size")
    .notEmpty()
    .withMessage("Serving size is required")
    .isFloat({ min: 0.1 })
    .withMessage("Serving size must be a number greater than 0"),
  body("serving_unit")
    .notEmpty()
    .withMessage("Serving unit is required")
    .isIn(["g", "ml", "oz"])
    .withMessage("Serving unit must be either 'g', 'ml', or 'oz'"),
];

const validateDeleteFood = [
  param("foodLogId")
    .notEmpty()
    .withMessage("Food log ID is required")
    .isUUID()
    .withMessage("Invalid food ID format"),
];

const validateDeleteFavoriteFood = [
  param("favFoodId")
    .notEmpty()
    .withMessage("Favorite food ID is required")
    .isUUID()
    .withMessage("Invalid favorite food ID format"),
];

const validateDeleteCustomFood = [
  param("customFoodId")
    .notEmpty()
    .withMessage("Custom food ID is required")
    .isUUID()
    .withMessage("Invalid custom food ID format"),
];

export default {
  validateGetFoodLogByDate,
  validateGetLogDates,
  validateAddFood,
  validateUpdateFood,
  validateDeleteFood,
};
