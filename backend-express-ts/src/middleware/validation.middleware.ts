import type { NextFunction, Request, Response } from "express";
import { z, type ZodType } from "zod";
import { BadRequestException } from "../utils/errors/app.error";

export interface RequestSchema {
  body?: ZodType;
  params?: ZodType;
  query?: ZodType;
}

/**
 * Validates and replaces req.body / req.params / req.query with the parsed
 * (coerced, defaulted, stripped) values. All errors are reported together.
 */
export const validation = (schema: RequestSchema) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    const issues: { location: string; path: string; message: string }[] = [];

    for (const key of ["body", "params", "query"] as const) {
      const keySchema = schema[key];
      if (!keySchema) continue;

      const result = keySchema.safeParse(req[key] ?? {});
      if (!result.success) {
        for (const issue of result.error.issues) {
          issues.push({ location: key, path: issue.path.join("."), message: issue.message });
        }
        continue;
      }

      if (key === "query") {
        // In Express 5 req.query is a getter, so it must be redefined rather than assigned.
        Object.defineProperty(req, "query", { value: result.data, writable: true, configurable: true });
      } else {
        (req as unknown as Record<string, unknown>)[key] = result.data;
      }
    }

    if (issues.length) {
      throw new BadRequestException("Validation failed", issues);
    }
    next();
  };
};

/** Helper to get the parsed type of a schema in services: `z.infer` re-exported for convenience. */
export type Infer<T extends ZodType> = z.infer<T>;
