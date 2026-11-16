import type { NextFunction, Request, Response } from "express";
import { QueryFailedError } from "typeorm";
import { env } from "../config/env";
import { AppError } from "../utils/errors/app.error";

// MySQL error codes worth translating into client errors.
const MYSQL_ERRORS: Record<string, { status: number; message: string }> = {
  ER_DUP_ENTRY: { status: 409, message: "A record with these values already exists" },
  ER_NO_REFERENCED_ROW_2: { status: 400, message: "Referenced record does not exist" },
  ER_ROW_IS_REFERENCED_2: { status: 409, message: "Record is still referenced by other records" },
  ER_CHECK_CONSTRAINT_VIOLATED: { status: 400, message: "Value violates a database constraint" },
  ER_DATA_TOO_LONG: { status: 400, message: "Value is too long" },
};

export const notFoundHandler = (req: Request, _res: Response, next: NextFunction) => {
  next(new AppError(`Route ${req.method} ${req.originalUrl} not found`, 404));
};

export const globalErrorHandler = (err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  const isDev = env.NODE_ENV === "development";

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ message: err.message, details: err.details });
  }

  if (err instanceof QueryFailedError) {
    const code = (err.driverError as { code?: string } | undefined)?.code;
    const mapped = code ? MYSQL_ERRORS[code] : undefined;
    if (mapped) {
      return res.status(mapped.status).json({
        message: mapped.message,
        ...(isDev && { details: err.message }),
      });
    }
  }

  // Malformed JSON body from express.json()
  if (err instanceof SyntaxError && "body" in err) {
    return res.status(400).json({ message: "Malformed JSON body" });
  }

  console.error(err);
  return res.status(500).json({
    message: "Internal server error",
    ...(isDev && { details: err instanceof Error ? err.message : err }),
  });
};
