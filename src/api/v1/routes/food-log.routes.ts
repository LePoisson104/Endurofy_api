import express, { Router } from "express";
import { handleValidationErrors } from "../middlewares/error.handlers";
import verifyJWT from "../middlewares/verify.JWT";
import foodLogControllers from "../controllers/food-log.controllers";

const router: Router = express.Router();

// router.use(verifyJWT);

router.get("/search-food/:searchItem", foodLogControllers.searchFood);

export default router;
