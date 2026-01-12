import { Request, Response, NextFunction } from "express";

export function errorMiddleware(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error(`[Error] ${req.method} ${req.url}:`, err);

  const status =
    typeof err === "object" && err.statusCode ? err.statusCode : 500;

  const message = err instanceof Error ? err.message : "Internal Server Error";

  res.status(status).json({
    ok: false,
    message,
  });
}
