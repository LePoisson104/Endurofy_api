import { body, param } from "express-validator";

const validateWorkoutProgramRequest = [
  body("programName").notEmpty().withMessage("Program name is required"),

  body("description").optional().isString(),

  body("workoutDays")
    .isArray({ min: 1 })
    .withMessage("At least one workout day is required"),

  body("workoutDays.*.dayNumber")
    .isInt({ min: 1 })
    .withMessage("Day must be a number greater than 0"),

  body("workoutDays.*.dayName").notEmpty().withMessage("Day name is required"),

  body("workoutDays.*.exercises")
    .isArray({ min: 1 })
    .withMessage("Each day must have at least one exercise"),

  body("workoutDays.*.exercises.*.exerciseName")
    .notEmpty()
    .withMessage("Exercise name is required"),

  body("workoutDays.*.exercises.*.bodyPart")
    .notEmpty()
    .withMessage("Body part is required"),

  body("workoutDays.*.exercises.*.laterality")
    .isIn(["bilateral", "unilateral"])
    .withMessage("Laterality must be 'bilateral' or 'unilateral'"),

  body("workoutDays.*.exercises.*.sets")
    .isInt({ min: 1 })
    .withMessage("Sets must be at least 1"),

  body("workoutDays.*.exercises.*.minReps")
    .isInt({ min: 1 })
    .withMessage("Min reps must be at least 1"),

  body("workoutDays.*.exercises.*.maxReps")
    .isInt({ min: 1 })
    .withMessage("Max reps must be at least 1"),

  // Custom validator to ensure maxReps >= minReps
  body("workoutDays.*.exercises.*").custom((exercise) => {
    if (exercise.maxReps < exercise.minReps) {
      throw new Error("Max reps must be greater than or equal to min reps");
    }
    return true;
  }),
];

const validateProgramId = [
  param("programId").notEmpty().withMessage("Program ID is required"),
];

const validateDayId = [
  param("dayId").notEmpty().withMessage("Day ID is required"),
];

const validateExerciseId = [
  param("exerciseId").notEmpty().withMessage("Exercise ID is required"),
];

const validateUpdateWorkoutProgramDescriptionRequest = [
  body("programName").notEmpty().withMessage("Program name is required"),
  body("description").optional().isString(),
];

const validateUpdateWorkoutProgramDayRequest = [
  body("dayName").notEmpty().withMessage("Day name is required"),
];

const validateUpdateWorkoutProgramExerciseRequest = [
  body("exerciseName").notEmpty().withMessage("Exercise name is required"),
  body("bodyPart").notEmpty().withMessage("Body part is required"),
  body("laterality").notEmpty().withMessage("Laterality is required"),
  body("sets").notEmpty().withMessage("Sets are required"),
  body("minReps").notEmpty().withMessage("Min reps are required"),
  body("maxReps").notEmpty().withMessage("Max reps are required"),
  body("exerciseOrder").notEmpty().withMessage("Exercise order is required"),
];

export default {
  validateWorkoutProgramRequest,
  validateProgramId,
  validateDayId,
  validateExerciseId,
  validateUpdateWorkoutProgramDescriptionRequest,
  validateUpdateWorkoutProgramDayRequest,
  validateUpdateWorkoutProgramExerciseRequest,
};
