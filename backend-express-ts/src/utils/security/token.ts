import { createHash, randomBytes } from "node:crypto";
import jwt from "jsonwebtoken";
import { env } from "../../config/env";
import { UnauthorizedException } from "../errors/app.error";

const UNIT_SECONDS = { s: 1, m: 60, h: 60 * 60, d: 24 * 60 * 60 } as const;

/** Parses "30s" / "15m" / "12h" / "7d" into seconds. Throws on anything else so bad config fails at startup. */
export const parseDurationSeconds = (value: string): number => {
  const match = /^(\d+)([smhd])$/.exec(value.trim());
  if (!match) throw new Error(`Invalid duration "${value}" (expected e.g. 30s, 15m, 12h, 7d)`);
  const seconds = Number(match[1]) * UNIT_SECONDS[match[2] as keyof typeof UNIT_SECONDS];
  if (seconds <= 0) throw new Error(`Duration "${value}" must be greater than zero`);
  return seconds;
};

export const ACCESS_TOKEN_TTL_SECONDS = parseDurationSeconds(env.JWT_ACCESS_EXPIRES_IN);
export const REFRESH_TOKEN_TTL_SECONDS = parseDurationSeconds(env.JWT_REFRESH_EXPIRES_IN);

// ---------------------------------------------------------------------------
// Access token: short-lived, stateless JWT sent as `Authorization: Bearer <token>`.
// ---------------------------------------------------------------------------

export interface AccessTokenPayload {
  /** User id. */
  sub: string;
  /** AuthSession id, so a request can be tied back to (and blocked by revoking) its session. */
  sid: string;
}

export const signAccessToken = ({ sub, sid }: AccessTokenPayload): string =>
  jwt.sign({ sid }, env.JWT_ACCESS_SECRET, {
    algorithm: "HS256",
    subject: sub,
    expiresIn: ACCESS_TOKEN_TTL_SECONDS,
  });

/** Verifies signature + expiry. Any failure becomes a 401. */
export const verifyAccessToken = (token: string): AccessTokenPayload => {
  let payload: string | jwt.JwtPayload;
  try {
    // Pin the algorithm so a token can't pick its own (e.g. "none").
    payload = jwt.verify(token, env.JWT_ACCESS_SECRET, { algorithms: ["HS256"] });
  } catch (err) {
    throw new UnauthorizedException(
      err instanceof jwt.TokenExpiredError ? "Access token expired" : "Invalid access token",
    );
  }
  if (typeof payload === "string" || typeof payload.sub !== "string" || typeof payload.sid !== "string") {
    throw new UnauthorizedException("Invalid access token");
  }
  return { sub: payload.sub, sid: payload.sid };
};

// ---------------------------------------------------------------------------
// Refresh token: long-lived, opaque random string. Only its hash is stored
// (auth_sessions.refresh_token_hash), so a DB leak doesn't leak usable tokens.
// ---------------------------------------------------------------------------

/** 256 bits of randomness, URL-safe. */
export const generateRefreshToken = (): string => randomBytes(32).toString("base64url");

/**
 * SHA-256 is enough here (unlike passwords): the token is already 256 random bits,
 * so it can't be brute-forced, and a fast hash keeps lookups by hash cheap.
 */
export const hashToken = (token: string): string => createHash("sha256").update(token).digest("hex");
