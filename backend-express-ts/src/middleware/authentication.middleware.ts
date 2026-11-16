import type { NextFunction, Request, Response } from "express";
import { NotImplementedException, UnauthorizedException } from "../utils/errors/app.error";

/**
 * Protects a route: must set `req.user` (and optionally `req.authSession`).
 *
 * TODO (auth module):
 *  1. Read the access token from `Authorization: Bearer <token>`.
 *  2. Verify it (e.g. jsonwebtoken) and extract the user id / session id.
 *  3. Load the user (status must be "active", not soft-deleted) and set `req.user`.
 */
export const authentication = () => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) {
      throw new UnauthorizedException("Missing bearer token");
    }

    throw new NotImplementedException("Authentication is not implemented yet");

    // req.user = user;
    // next();
  };
};

/** Shortcut for handlers behind `authentication()`. */
export const currentUserId = (req: Request): string => {
  if (!req.user) throw new UnauthorizedException();
  return req.user.id;
};
