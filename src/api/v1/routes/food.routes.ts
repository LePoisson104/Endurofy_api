import express, { Router } from "express";
import { handleValidationErrors } from "../middlewares/error.handlers";
import verifyJWT from "../middlewares/verify.JWT";
import foodControllers from "../controllers/food.controllers";
import foodValidations from "../validations/food.validations";

const router: Router = express.Router();

router.use(verifyJWT);

////////////////////////////////////////////////////////////////////////////////////////////////
// @GET ROUTES - SEARCH FOOD
////////////////////////////////////////////////////////////////////////////////////////////////

router.get(
  "/search/:searchItem",
  foodValidations.validateSearchFood,
  handleValidationErrors,
  foodControllers.searchFood
);

////////////////////////////////////////////////////////////////////////////////////////////////
// @GET ROUTES
////////////////////////////////////////////////////////////////////////////////////////////////

router.get("/favorites", foodControllers.getFavoriteFood);

router.get("/recent", foodControllers.getRecentFood);

router.get(
  "/favorites/:foodId",
  foodValidations.validateGetIsFavoriteFood,
  handleValidationErrors,
  foodControllers.getIsFavoriteFood
);

router.post(
  "/favorites/batch",
  foodValidations.validateGetFavoriteStatusBatch,
  handleValidationErrors,
  foodControllers.getFavoriteStatusBatch
);

router.get("/custom", handleValidationErrors, foodControllers.getCustomFood);

////////////////////////////////////////////////////////////////////////////////////////////////
// @POST ROUTES
////////////////////////////////////////////////////////////////////////////////////////////////

router.post(
  "/favorites",
  foodValidations.validateAddFavoriteFood,
  handleValidationErrors,
  foodControllers.addFavoriteFood
);

router.post(
  "/custom",
  foodValidations.validateAddCustomFood,
  handleValidationErrors,
  foodControllers.addCustomFood
);

////////////////////////////////////////////////////////////////////////////////////////////////
// @PATCH ROUTES - CUSTOM FOOD
////////////////////////////////////////////////////////////////////////////////////////////////

router.patch(
  "/custom/:foodItemId",
  foodValidations.validateFoodItemId,
  handleValidationErrors,
  foodControllers.updateCustomFood
);

////////////////////////////////////////////////////////////////////////////////////////////////
// @DELETE ROUTES
////////////////////////////////////////////////////////////////////////////////////////////////

router.delete(
  "/favorites/:favFoodId",
  foodValidations.validateDeleteFavoriteFood,
  handleValidationErrors,
  foodControllers.deleteFavoriteFood
);

router.delete(
  "/custom/:foodItemId",
  foodValidations.validateFoodItemId,
  handleValidationErrors,
  foodControllers.deleteCustomFood
);

export default router;
