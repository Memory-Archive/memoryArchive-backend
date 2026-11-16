import type { AuthSession, User } from "../DB/models";

declare global {
  namespace Express {
    interface Request {
      /** Set by the authentication middleware. */
      user?: User;
      /** The refresh-token session the current access token belongs to, if tracked. */
      authSession?: AuthSession;
    }
  }
}

export {};
