import { param } from "express-validator";

const validateGetWorkoutProgressionAnalytics = [
  param("userId").isUUID().withMessage("Invalid user ID"),
  param("programId").isUUID().withMessage("Invalid program ID"),
  param("programExerciseId")
    .notEmpty()
    .withMessage("Program Exercise ID is required"),
  param("startDate").isISO8601().withMessage("Start date must be a valid date"),
  param("endDate").isISO8601().withMessage("End date must be a valid date"),
];

export default {
  validateGetWorkoutProgressionAnalytics,
};
