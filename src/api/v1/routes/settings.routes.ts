import express, { Router } from "express";
import { handleValidationErrors } from "../middlewares/error.handlers";
import verifyJWT from "../middlewares/verify.JWT";
import settingsControllers from "../controllers/settings.controllers";
import { validateToggleTheme } from "../validations/settings-validation";

const router: Router = express.Router();

router.use(verifyJWT);

////////////////////////////////////////////////////////////////////////////////////////////////
// @GET ROUTES - SEARCH FOOD
////////////////////////////////////////////////////////////////////////////////////////////////

router.get("/", settingsControllers.getSettings);

router.patch(
  "/toggle-theme",
  validateToggleTheme,
  handleValidationErrors,
  settingsControllers.toggleTheme
);

export default router;
