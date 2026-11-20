import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { AppError, type FieldErrors } from "../errors/AppError";
import {
  BadRequestError,
  UnauthorizedError,
  ValidationError,
} from "../errors/http-errors";
import {
  flattenClassValidatorErrors,
  isClassValidatorErrors,
} from "../errors/validation-errors";
import { translateDatabaseError } from "../errors/database-errors";

type ErrorBody = {
  success: false;
  message: string;
  code: string;
  errors?: FieldErrors;
  // Solo en desarrollo, para depurar sin mirar el log
  stack?: string;
};

export const errorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const isDev = process.env.NODE_ENV !== "production";
  let appError: AppError;

  if (err instanceof AppError) {
    appError = err;
  } else if (isClassValidatorErrors(err)) {
  /*else if (err instanceof ZodError) {
    // Zod: { email: 'Correo invalido', password: 'monimo 8 caracteres'}
    const details: FieldErrors = {};
    for (const issue of err.issues) {
      const field = issue.path.join(".") || "body";
      details[field] = issue.message;
    }
    appError = new ValidationError("Revisa los datos del formulario.", details);
  }
    */
    appError = new ValidationError(
      "Revisa los datos del formulario.",
      flattenClassValidatorErrors(err),
    );
  } else if (err instanceof jwt.TokenExpiredError) {
    appError = new UnauthorizedError(
      "Tu sesión expiró. Inicia sesión de nuevo",
    );
  } else if (err instanceof jwt.JsonWebTokenError) {
    appError = new UnauthorizedError("Token inválido.");
  } else if (
    err instanceof SyntaxError &&
    "body" in (err as unknown as Record<string, unknown>)
  ) {
    // express.json() con un JSON mal formado.
    appError = new BadRequestError(
      "El cuerpo de la petición no es un JSON válido.",
    );
  } else {
    // TypeORM / postgres u otro error inesperador.
    appError =
      translateDatabaseError(err) ??
      new AppError(
        "Error interno del servidor. Inténtalo de nuevo.",
        500,
        "INTERNAL_ERROR",
      );
  }

  // Log en el servidor: Aquí si va el error completo
  if (appError.statusCode >= 500) {
    console.error(`[${req.method} ${req.originalUrl}]`, err);
  } else {
    console.warn(
      `[${req.method} ${req.originalUrl}] ${appError.statusCode} ${appError.message}`,
    );
  }

  if (res.headersSent) return;

  const body: ErrorBody = {
    success: false,
    message: appError.message,
    code: appError.code,
    ...(appError.details ? { errors: appError.details } : {}),
    ...(isDev && err instanceof Error ? { stack: err.stack } : {}),
  };

  res.status(appError.statusCode).json(body);
};
