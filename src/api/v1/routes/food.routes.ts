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

router.get(
  "/:userId/custom",
  handleValidationErrors,
  foodControllers.getCustomFood
);

router.get(
  "/custom/:foodId",
  foodValidations.validateGetCustomFoodById,
  handleValidationErrors,
  foodControllers.getCustomFoodById
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
  foodValidations.validateCustomFood,
  handleValidationErrors,
  foodControllers.addCustomFood
);

////////////////////////////////////////////////////////////////////////////////////////////////
// @PATCH ROUTES - CUSTOM FOOD
////////////////////////////////////////////////////////////////////////////////////////////////

router.put(
  "/custom/:customFoodId",
  foodValidations.validateCustomFood,
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
  "/custom/:customFoodId",
  foodValidations.validateDeleteCustomFood,
  handleValidationErrors,
  foodControllers.deleteCustomFood
);

export default router;
