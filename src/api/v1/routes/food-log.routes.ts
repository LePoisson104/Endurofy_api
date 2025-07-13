import express, { Router } from "express";
import { handleValidationErrors } from "../middlewares/error.handlers";
import verifyJWT from "../middlewares/verify.JWT";
import foodLogControllers from "../controllers/food-log.controllers";
import foodLogValidations from "../validations/food-log.validations";

const router: Router = express.Router();

// Apply JWT middleware to all routes
router.use(verifyJWT);

////////////////////////////////////////////////////////////////////////////////////////////////
// @GET ROUTES
////////////////////////////////////////////////////////////////////////////////////////////////

// Get all food logs by date for a user
router.get(
  "/:userId/date/:date",
  foodLogValidations.validateGetFoodLogByDate,
  handleValidationErrors,
  foodLogControllers.getAllFood
);

// Get favorite food for a user
router.get(
  "/:userId/favorites",
  handleValidationErrors,
  foodLogControllers.getFavoriteFood
);

// Check if a food is favorite for a user
router.get(
  "/:userId/favorites/:foodId",
  foodLogValidations.validateGetIsFavoriteFood,
  handleValidationErrors,
  foodLogControllers.getIsFavoriteFood
);

// Get log dates for a user within a date range
router.get(
  "/:userId/dates/:startDate/:endDate",
  foodLogValidations.validateGetLogDates,
  handleValidationErrors,
  foodLogControllers.getLoggedDates
);

// Get custom food for a user
router.get(
  "/:userId/custom",
  handleValidationErrors,
  foodLogControllers.getCustomFood
);

// Get custom food by ID
router.get(
  "/custom/:foodId",
  foodLogValidations.validateGetCustomFoodById,
  handleValidationErrors,
  foodLogControllers.getCustomFoodById
);

// Search food from USDA database
router.get(
  "/search/:searchItem",
  foodLogValidations.validateSearchFood,
  handleValidationErrors,
  foodLogControllers.searchFood
);

////////////////////////////////////////////////////////////////////////////////////////////////
// @POST ROUTES
////////////////////////////////////////////////////////////////////////////////////////////////

// Add food log for a user
router.post(
  "/:userId",
  foodLogValidations.validateAddFood,
  handleValidationErrors,
  foodLogControllers.addFood
);

// Add favorite food for a user
router.post(
  "/:userId/favorites",
  foodLogValidations.validateAddFavoriteFood,
  handleValidationErrors,
  foodLogControllers.addFavoriteFood
);

// Add custom food for a user
router.post(
  "/:userId/custom",
  foodLogValidations.validateAddCustomFood,
  handleValidationErrors,
  foodLogControllers.addCustomFood
);

////////////////////////////////////////////////////////////////////////////////////////////////
// @PATCH ROUTES
////////////////////////////////////////////////////////////////////////////////////////////////

// Update food log serving size
router.patch(
  "/food/:foodId",
  foodLogValidations.validateUpdateFood,
  handleValidationErrors,
  foodLogControllers.updateFood
);

// Update custom food
router.patch(
  "/custom/:customFoodId",
  foodLogValidations.validateUpdateCustomFood,
  handleValidationErrors,
  foodLogControllers.updateCustomFood
);

////////////////////////////////////////////////////////////////////////////////////////////////
// @DELETE ROUTES
////////////////////////////////////////////////////////////////////////////////////////////////

// Delete food log
router.delete(
  "/food/:foodId",
  foodLogValidations.validateDeleteFood,
  handleValidationErrors,
  foodLogControllers.deleteFood
);

// Delete favorite food
router.delete(
  "/favorites/:favFoodId",
  foodLogValidations.validateDeleteFavoriteFood,
  handleValidationErrors,
  foodLogControllers.deleteFavoriteFood
);

// Delete custom food
router.delete(
  "/custom/:customFoodId",
  foodLogValidations.validateDeleteCustomFood,
  handleValidationErrors,
  foodLogControllers.deleteCustomFood
);

export default router;
