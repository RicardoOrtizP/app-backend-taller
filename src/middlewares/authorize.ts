import type { NextFunction, Request, Response } from "express";
import {
  hasAllPermissions,
  hasAnyPermission,
  type Permission,
  type Role,
} from "../modules/auth/types/auth.types";
import { getAuthUser } from "./authenticate";
import { ForbiddenError } from "../errors/http-errors";

// El usuario debe tener UNO de estos roles.
export function requireRole(...roles: Role[]) {
  return (_req: Request, res: Response, next: NextFunction): void => {
    try {
      const user = getAuthUser(res);
      if (!roles.includes(user.role)) {
        throw new ForbiddenError(
          "No tienes permiso para realizar esta acción.",
        );
      }
      next();
    } catch (error) {
      next(error);
    }
  };
}

// El usuario debe tener todos estos permisos
export function requirePermission(...permissions: Permission[]) {
  return (_req: Request, res: Response, next: NextFunction): void => {
    try {
      const user = getAuthUser(res);
      if (!hasAllPermissions(user.role, permissions)) {
        throw new ForbiddenError(
          "No tienes permisos para realizar esta acción.",
        );
      }
    } catch (error) {
      next(error);
    }
  };
}

// El usuario debe tener al menos uno de estos permisos
export function requireAnyPermission(...permissions: Permission[]) {
  return (_req: Request, res: Response, next: NextFunction): void => {
    try {
      const user = getAuthUser(res);
      if (!hasAnyPermission(user.role, permissions)) {
        throw new ForbiddenError(
          "No tienes permiso para realizar esta acción.",
        );
      }
      next();
    } catch (error) {
      next(error);
    }
  };
}
