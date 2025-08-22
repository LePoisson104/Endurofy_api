import express, { Router } from "express";
import { handleValidationErrors } from "../middlewares/error.handlers";
import verifyJWT from "../middlewares/verify.JWT";
import foodControllers from "../controllers/food.controllers";
import foodValidations from "../validations/food.validations";

const router: Router = express.Router();

// router.use(verifyJWT);

////////////////////////////////////////////////////////////////////////////////////////////////
// @GET ROUTES - SEARCH FOOD
////////////////////////////////////////////////////////////////////////////////////////////////

router.get(
  "/:userId/search/:searchItem",
  foodValidations.validateSearchFood,
  handleValidationErrors,
  foodControllers.searchFood
);

////////////////////////////////////////////////////////////////////////////////////////////////
// @GET ROUTES
////////////////////////////////////////////////////////////////////////////////////////////////

router.get(
  "/:userId/favorites",
  handleValidationErrors,
  foodControllers.getFavoriteFood
);

router.get(
  "/:userId/favorites/:foodId",
  foodValidations.validateGetIsFavoriteFood,
  handleValidationErrors,
  foodControllers.getIsFavoriteFood
);

router.post(
  "/:userId/favorites/batch",
  foodValidations.validateGetFavoriteStatusBatch,
  handleValidationErrors,
  foodControllers.getFavoriteStatusBatch
);

router.get(
  "/:userId/custom",
  handleValidationErrors,
  foodControllers.getCustomFood
);

////////////////////////////////////////////////////////////////////////////////////////////////
// @POST ROUTES
////////////////////////////////////////////////////////////////////////////////////////////////

router.post(
  "/:userId/favorites",
  foodValidations.validateAddFavoriteFood,
  handleValidationErrors,
  foodControllers.addFavoriteFood
);

router.post(
  "/:userId/custom",
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
  "/:userId/custom/:foodItemId",
  foodValidations.validateFoodItemId,
  handleValidationErrors,
  foodControllers.deleteCustomFood
);

export default router;
