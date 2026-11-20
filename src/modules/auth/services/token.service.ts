import jwt from "jsonwebtoken";
import crypto from "node:crypto";

import type { AccessTokenPayload, PublicUser } from "../types/auth.types";

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET as string;
const ACCESS_TOKEN_EXPIRES_IN = process.env.ACCESS_TOKEN_EXPIRES_IN as string;
const REFRESH_TOKEN_DAYS = Number(process.env.REFRESH_TOKEN_DAYS ?? 7);
const RESET_TOKEN_MINUTES = Number(process.env.RESET_TOKEN_MINUTES ?? 60);

// Generación del Access Token, JWT corto, con solo sub/email/role
export function signAccessToken(user: PublicUser): string {
  const payload: AccessTokenPayload = {
    sub: user.id,
    email: user.email,
    role: user.role,
  };
  return jwt.sign(payload, ACCESS_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRES_IN as NonNullable<
      jwt.SignOptions["expiresIn"]
    >,
  });
}
export function verifyAccessToken(token: string): AccessTokenPayload {
  return jwt.verify(token, ACCESS_SECRET) as AccessTokenPayload;
}

export function generateRefreshToken(): string {
  return crypto.randomBytes(48).toString("hex"); // 96 caracteres hex
}

export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

/** Lo mismo vale para el token de recuperación de contraseña. */
export function generateResetToken(): string {
  return crypto.randomBytes(32).toString("hex"); // 64 caracteres, pasa el @MinLength(32) del DTO
}

export function refreshTokenExpiresAt(from = new Date()): Date {
  return new Date(from.getTime() + REFRESH_TOKEN_DAYS * 24 * 60 * 60 * 1000);
}

export function resetTokenExpiresAt(from = new Date()): Date {
  return new Date(from.getTime() + RESET_TOKEN_MINUTES * 60 * 1000);
}
