import type { CookieOptions, Response } from "express";

export const REFRESH_COOKIE = "refreshToken";

function cookieOptions(): CookieOptions {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/api/auth",
    // maxAge: Number(process.env.REFRESH_TOKEN_DAYS) * 24 * 60 * 60 * 1000,
  };
}

export function setRefreshCookie(res: Response, refreshToken: string): void {
  const days = Number(process.env.REFRESH_TOKEN_DAYS) || 7;
  res.cookie(REFRESH_COOKIE, refreshToken, {
    ...cookieOptions(),
    maxAge: days * 24 * 60 * 60 * 1000,
  });
}

// export function clearRefreshCookie(res: Response): void {
//   const { maxAge: _maxAge, ...options } = cookieOptions();
//   res.clearCookie(REFRESH_COOKIE, options);
// }
export function clearRefreshCookie(res: Response): void {
  res.clearCookie(REFRESH_COOKIE, cookieOptions());
}
