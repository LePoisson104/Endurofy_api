import { body, param } from "express-validator";

const validateCreateWorkoutLogRequest = [
  body("workoutName").notEmpty().withMessage("Workout name is required"),
  body("workoutDate").notEmpty().withMessage("Workout date is required"),
  body("exerciseNotes").isString(),
  body("setNumber").notEmpty().withMessage("Set number is required"),
  body("repsLeft").notEmpty().withMessage("Reps left is required"),
  body("repsRight").notEmpty().withMessage("Reps right is required"),
  body("weight").notEmpty().withMessage("Weight is required"),
  body("weightUnit")
    .notEmpty()
    .isIn(["kg", "lb"])
    .withMessage("Weight unit is required"),
  body("exerciseName").notEmpty().withMessage("Exercise name is required"),
  body("bodyPart").notEmpty().withMessage("Body part is required"),
  body("laterality")
    .notEmpty()
    .isIn(["bilateral", "unilateral"])
    .withMessage("Laterality is required"),
  body("exerciseOrder").notEmpty().withMessage("Exercise order is required"),
  body("programExerciseId")
    .notEmpty()
    .withMessage("Program exercise id is required"),
];

const validateGetWorkoutLogByDate = [
  param("startDate").notEmpty().withMessage("Start date is required"),
  param("endDate").notEmpty().withMessage("End date is required"),
  param("startDate").isDate().withMessage("Start date must be a valid date"),
  param("endDate").isDate().withMessage("End date must be a valid date"),
];

const validateDeleteWorkoutSet = [
  param("workoutSetId")
    .isUUID()
    .withMessage("Invalid workout set id format")
    .notEmpty()
    .withMessage("Workout set id is required"),
  param("workoutExerciseId")
    .isUUID()
    .withMessage("Invalid workout exercise id format")
    .notEmpty()
    .withMessage("Workout exercise id is required"),
  param("workoutLogId")
    .isUUID()
    .withMessage("Invalid workout log id format")
    .notEmpty()
    .withMessage("Workout log id is required"),
];

const validateAddExerciseNote = [
  param("workoutExerciseId")
    .isUUID()
    .withMessage("Invalid workout exercise id format")
    .notEmpty()
    .withMessage("Workout exercise id is required"),
  body("exerciseNotes")
    .optional()
    .isString()
    .withMessage("Exercise note must be a string"),
];

const validateUpdateWorkoutSet = [
  param("workoutSetId")
    .isUUID()
    .withMessage("Invalid workout set id format")
    .notEmpty()
    .withMessage("Workout set id is required"),
  param("workoutExerciseId")
    .isUUID()
    .withMessage("Invalid workout exercise id format")
    .notEmpty()
    .withMessage("Workout exercise id is required"),

  body("leftReps")
    .isInt({ min: 1 })
    .withMessage("Reps left must be a number greater than 0"),

  body("rightReps")
    .isInt({ min: 1 })
    .withMessage("Reps right must be a number greater than 0"),

  body("weight")
    .isFloat({ min: 0.1 })
    .withMessage("Weight must be a number greater than 0"),

  body("weightUnit")
    .isIn(["kg", "lb"])
    .withMessage("Weight unit must be either kg or lb"),
];

const validateSetWorkoutLogStatus = [
  param("workoutLogId")
    .isUUID()
    .withMessage("Invalid workout log id format")
    .notEmpty()
    .withMessage("Workout log id is required"),
  body("status")
    .notEmpty()
    .isIn(["incomplete", "completed"])
    .withMessage("Status must be either incomplete or completed"),
];

export default {
  validateCreateWorkoutLogRequest,
  validateGetWorkoutLogByDate,
  validateDeleteWorkoutSet,
  validateAddExerciseNote,
  validateUpdateWorkoutSet,
  validateSetWorkoutLogStatus,
};
