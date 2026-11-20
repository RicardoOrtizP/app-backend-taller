import type { NextFunction, Request, Response } from "express";
import {
  permissionsFor,
  type AuthUser,
} from "../modules/auth/types/auth.types";
import { UnauthorizedError } from "../errors/http-errors";
import { verifyAccessToken } from "../modules/auth/services/token.service";

export function authenticate(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  try {
    // obtener el encabezado authorization
    const header = req.get("authorization");
    // Obtener el token que viene en el encabezado
    const token = header?.startsWith("Bearer ")
      ? header.split(" ")[1]
      : undefined;

    if (!token) {
      throw new UnauthorizedError(
        "Token de acceso no valido. Inicia sesion de nuevo.",
      );
    }

    const payload = verifyAccessToken(token);

    const user: AuthUser = {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
      permissions: permissionsFor(payload.role),
    };
    res.locals.user = user;
    next();
  } catch (error) {
    next(error);
  }
}

/**
 * Lee el usuario autenticado que dejo 'authenticate' en res.locals.user . Si no hay sesion, 401. Los controladores y authorize usan esto para leer res.locals directamente
 *
 */
export function getAuthUser(res: Response): AuthUser {
  const user = res.locals.user as AuthUser | undefined;
  if (!user)
    throw new UnauthorizedError("No autenticado. Inicia sesión de nuevo.");
  return user;
}
