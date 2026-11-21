import type { NextFunction, Request, Response } from "express";
import { DBService } from "../DB/db.service";
import { AuthSession, User } from "../DB/models";
import { UnauthorizedException } from "../utils/errors/app.error";
import { verifyAccessToken } from "../utils/security/token";

const sessionModel = new DBService(AuthSession);
const userModel = new DBService(User);

/**
 * Protects a route: requires `Authorization: Bearer <access token>` and sets
 * `req.user` and `req.authSession` for the handlers after it.
 *
 * The JWT signature only proves the token was issued by us and hasn't expired.
 * The session lookup is what makes logout (and refresh-token reuse detection)
 * take effect immediately instead of after the access token's TTL.
 */
export const authentication = () => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) {
      throw new UnauthorizedException("Missing bearer token");
    }

    // Throws 401 on a bad signature, wrong algorithm, expiry or malformed payload.
    const { sub: userId, sid } = verifyAccessToken(header.slice("Bearer ".length).trim());

    const session = await sessionModel.findOneBy({ id: sid });
    if (!session || session.userId !== userId || session.revokedAt || session.expiresAt <= new Date()) {
      throw new UnauthorizedException("Session is no longer valid");
    }

    // findOneBy skips soft-deleted users, so a deleted account fails here too.
    const user = await userModel.findOneBy({ id: userId });
    if (!user || user.status !== "active") {
      throw new UnauthorizedException("Session is no longer valid");
    }

    req.user = user;
    req.authSession = session;
    next();
  };
};

/** Shortcut for handlers behind `authentication()`. */
export const currentUserId = (req: Request): string => {
  if (!req.user) throw new UnauthorizedException();
  return req.user.id;
};
