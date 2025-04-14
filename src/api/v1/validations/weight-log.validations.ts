import { body, query, param } from "express-validator";

const validateWeightLogPayload = [
  body("weight")
    .notEmpty()
    .withMessage("Weight is required!")
    .isFloat({ min: 0 })
    .withMessage("Weight must be a number"),
  body("weightUnit")
    .notEmpty()
    .withMessage("Weight unit is required!")
    .isIn(["kg", "lb"])
    .withMessage("Weight unit must be either kg or lb"),
  body("caloriesIntake")
    .notEmpty()
    .withMessage("Calories intake is required!")
    .isFloat({ min: 0 })
    .withMessage("Calories intake must be a number"),
  body("logDate")
    .notEmpty()
    .withMessage("Date is required!")
    .isDate()
    .withMessage("Date must be a valid date")
    .custom((value) => {
      const today = new Date().toLocaleDateString("en-CA");
      const inputDate = new Date(value).toISOString().split("T")[0];

      if (inputDate > today) {
        throw new Error("Date cannot be in the future");
      }
      return true;
    }),
  body("notes").optional().isString().withMessage("Notes must be a string"),
];

const validateGetWeightLogByDate = [
  query("startDate")
    .optional({ checkFalsy: true }) // allows undefined, null, or empty string
    .isDate()
    .withMessage("Start date must be a valid date"),
  query("endDate")
    .optional({ checkFalsy: true })
    .isDate()
    .withMessage("End date must be a valid date"),
  query("options")
    .notEmpty()
    .withMessage("Options is required!")
    .isIn(["all", "date"])
    .withMessage("Options must be either all or date"),
  query("withRates")
    .notEmpty()
    .isIn(["true", "false"])
    .withMessage("With rates must be either true or false"),
];

const validateWeightLogId = [
  param("weightLogId")
    .notEmpty()
    .withMessage("Weight log id is required!")
    .isUUID()
    .withMessage("Weight log id must be a valid UUID"),
];

const validateUpdateWeightLog = [
  param("weightLogId")
    .notEmpty()
    .withMessage("Weight log id is required!")
    .isUUID()
    .withMessage("Weight log id must be a valid UUID"),
  body("weight")
    .notEmpty()
    .withMessage("Weight is required!")
    .isFloat({ min: 0 })
    .withMessage("Weight must be a number"),
  body("weightUnit")
    .notEmpty()
    .withMessage("Weight unit is required!")
    .isIn(["kg", "lb"])
    .withMessage("Weight unit must be either kg or lb"),
  body("caloriesIntake")
    .notEmpty()
    .withMessage("Calories intake is required!")
    .isFloat({ min: 0 })
    .withMessage("Calories intake must be a number"),
  body("logDate")
    .notEmpty()
    .withMessage("Date is required!")
    .isDate()
    .withMessage("Date must be a valid date"),
  body("notes").optional().isString().withMessage("Notes must be a string"),
];

const validateConvertAllWeightLogsByUnits = [
  param("userId")
    .notEmpty()
    .withMessage("User id is required!")
    .isUUID()
    .withMessage("User id must be a valid UUID"),
  body("weightUnit")
    .notEmpty()
    .withMessage("Weight unit is required!")
    .isIn(["kg", "lb"])
    .withMessage("Weight unit must be either kg or lb"),
];

export default {
  validateWeightLogPayload,
  validateGetWeightLogByDate,
  validateWeightLogId,
  validateUpdateWeightLog,
  validateConvertAllWeightLogsByUnits,
};
