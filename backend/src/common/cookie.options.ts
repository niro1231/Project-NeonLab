import type { CookieOptions } from 'express';

const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Options for the auth cookie.
 *
 * In production the frontend (Vercel) and the backend (Render) live on
 * different domains, so the cookie must be `SameSite=None` + `Secure`,
 * otherwise the browser refuses to send it along with the request.
 * Locally both run on http://localhost, so `lax` + non-secure is fine.
 */
export function authCookieOptions(): CookieOptions {
  const isProduction = process.env.NODE_ENV === 'production';

  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    partitioned: isProduction,
    path: '/',
    maxAge: ONE_WEEK_MS,
  };
}

/** Same options without `maxAge` - used when clearing the cookie on logout. */
export function clearCookieOptions(): CookieOptions {
  const { maxAge: _maxAge, ...rest } = authCookieOptions();
  return rest;
}
