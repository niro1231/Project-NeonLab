import type { Request } from 'express';

/** Name of the HTTP-only cookie that carries the JWT. */
export const AUTH_COOKIE = 'access_token';

/** What we put inside the JWT when a user logs in. */
export interface JwtPayload {
  sub: string; // the user's id
  email: string;
}

/** What the guard attaches to the request after a valid token. */
export interface AuthUser {
  userId: string;
  email: string;
}

/** An Express request that has passed through JwtAuthGuard. */
export interface RequestWithUser extends Request {
  user?: AuthUser;
}
