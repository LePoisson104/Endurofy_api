import express, { Router } from "express";
import { handleValidationErrors } from "../middlewares/error.handlers";
import verifyJWT from "../middlewares/verify.JWT";
import foodLogControllers from "../controllers/food-log.controllers";
import foodLogValidations from "../validations/food-log.validations";

const router: Router = express.Router();

// router.use(verifyJWT);

////////////////////////////////////////////////////////////////////////////////////////////////
// @GET ROUTES
////////////////////////////////////////////////////////////////////////////////////////////////

router.get(
  "/:userId/date/:date",
  foodLogValidations.validateGetFoodLogByDate,
  handleValidationErrors,
  foodLogControllers.getAllFood
);

router.get(
  "/:userId/dates/:startDate/:endDate",
  foodLogValidations.validateGetLogDates,
  handleValidationErrors,
  foodLogControllers.getLoggedDates
);

////////////////////////////////////////////////////////////////////////////////////////////////
// @POST ROUTES
////////////////////////////////////////////////////////////////////////////////////////////////

router.post(
  "/:userId",
  foodLogValidations.validateAddFood,
  handleValidationErrors,
  foodLogControllers.addFood
);

////////////////////////////////////////////////////////////////////////////////////////////////
// @PATCH ROUTES
////////////////////////////////////////////////////////////////////////////////////////////////

router.patch(
  "/food/:foodId",
  foodLogValidations.validateUpdateFood,
  handleValidationErrors,
  foodLogControllers.updateFood
);

////////////////////////////////////////////////////////////////////////////////////////////////
// @DELETE ROUTES
////////////////////////////////////////////////////////////////////////////////////////////////

router.delete(
  "/food/:foodId",
  foodLogValidations.validateDeleteFood,
  handleValidationErrors,
  foodLogControllers.deleteFood
);

export default router;
