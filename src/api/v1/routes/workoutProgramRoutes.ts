import express, { Router } from "express";
import userValidation from "../validations/user.validation";
import { handleValidationErrors } from "../middlewares/error.handlers";
import workoutProgramControllers from "../controllers/workout-program.controllers";
import verifyJWT from "../middlewares/verify.JWT";

const router: Router = express.Router();

router.use(verifyJWT);

router.post(
  "/create-workout-program/:userId",
  workoutProgramControllers.createWorkoutProgram
);

export default router;
