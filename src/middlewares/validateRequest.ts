import { validationResult, ValidationError } from "express-validator";
import { Request, Response, NextFunction } from "express";

export function validateRequest(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      ok: false,
      errors: errors.array().map((err: ValidationError) => {
        if (err.type === "field") {
          return {
            field: err.path,
            message: err.msg,
          };
        }

        return {
          field: "general",
          message: err.msg,
        };
      }),
    });
  }

  next();
}
