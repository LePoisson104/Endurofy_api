import { body } from "express-validator";

const validateCreateWorkoutLogRequest = [
  body("title").notEmpty().withMessage("Title is required"),
  body("workoutDate").notEmpty().withMessage("Workout date is required"),
  body("notes").isString(),
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

export default {
  validateCreateWorkoutLogRequest,
};
