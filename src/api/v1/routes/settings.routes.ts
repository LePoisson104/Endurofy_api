import express, { Router } from "express";
import { handleValidationErrors } from "../middlewares/error.handlers";
import verifyJWT from "../middlewares/verify.JWT";
import settingsControllers from "../controllers/settings.controllers";

const router: Router = express.Router();

// router.use(verifyJWT);

////////////////////////////////////////////////////////////////////////////////////////////////
// @GET ROUTES - SEARCH FOOD
////////////////////////////////////////////////////////////////////////////////////////////////

router.get("/:userId", settingsControllers.getSettings);

export default router;
