import type { Response } from "express";

export const successResponse = <T>(
  res: Response,
  { status = 200, message = "Done", data }: { status?: number; message?: string; data?: T } = {},
): Response => {
  return res.status(status).json({ message, data });
};
