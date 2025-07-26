import { body, param } from "express-validator";

////////////////////////////////////////////////////////////////////////////////////////////////
// @SEARCH FOOD VALIDATIONS
////////////////////////////////////////////////////////////////////////////////////////////////
const validateSearchFood = [
  param("searchItem")
    .notEmpty()
    .withMessage("Search item is required")
    .isString()
    .withMessage("Search item must be a string")
    .isLength({ min: 2, max: 100 })
    .withMessage("Search item must be between 2 and 100 characters"),
];

////////////////////////////////////////////////////////////////////////////////////////////////
// @FAVORITE FOOD VALIDATIONS
////////////////////////////////////////////////////////////////////////////////////////////////
const validateGetIsFavoriteFood = [
  param("foodId")
    .notEmpty()
    .withMessage("Food ID is required")
    .isString()
    .withMessage("Food ID must be a string"),
];

const validateAddFavoriteFood = [
  body("foodId")
    .notEmpty()
    .withMessage("Food ID is required")
    .isString()
    .withMessage("Food ID must be a string"),
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
];

const validateDeleteFavoriteFood = [
  param("favFoodId")
    .notEmpty()
    .withMessage("Favorite food ID is required")
    .isUUID()
    .withMessage("Invalid favorite food ID format"),
];

////////////////////////////////////////////////////////////////////////////////////////////////
// @CUSTOM FOOD VALIDATIONS
////////////////////////////////////////////////////////////////////////////////////////////////
const validateGetCustomFoodById = [
  param("foodId")
    .notEmpty()
    .withMessage("Food ID is required")
    .isUUID()
    .withMessage("Invalid food ID format"),
];

const validateAddCustomFood = [
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
    .notEmpty()
    .withMessage("Fiber is required")
    .isFloat({ min: 0 })
    .withMessage("Fiber must be a number greater than or equal to 0"),
  body("sugar")
    .notEmpty()
    .withMessage("Sugar is required")
    .isFloat({ min: 0 })
    .withMessage("Sugar must be a number greater than or equal to 0"),
  body("sodium")
    .notEmpty()
    .withMessage("Sodium is required")
    .isFloat({ min: 0 })
    .withMessage("Sodium must be a number greater than or equal to 0"),
  body("cholesterol")
    .notEmpty()
    .withMessage("Cholesterol is required")
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

const validateDeleteCustomFood = [
  param("customFoodId")
    .notEmpty()
    .withMessage("Custom food ID is required")
    .isUUID()
    .withMessage("Invalid custom food ID format"),
];

export default {
  // Search Food
  validateSearchFood,
  // Favorite Food
  validateGetIsFavoriteFood,
  validateAddFavoriteFood,
  validateDeleteFavoriteFood,
  // Custom Food
  validateGetCustomFoodById,
  validateAddCustomFood,
  validateUpdateCustomFood,
  validateDeleteCustomFood,
};
