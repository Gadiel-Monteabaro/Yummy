import { param } from "express-validator";

export const validateIdParam = (paramName = "id") =>
  param(paramName)
    .toInt()
    .isInt({ min: 1 })
    .withMessage("ID must be a positive integer");
