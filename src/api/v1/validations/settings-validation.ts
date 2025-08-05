import { body } from "express-validator";

export const validateToggleTheme = [
  body("theme")
    .notEmpty()
    .withMessage("Theme is required")
    .isIn(["light", "dark", "system"])
    .withMessage("Invalid theme"),
];
