import type { NextFunction, Request, Response } from "express";
import { NotFoundError } from "../errors/http-errors";

/**
 * notFound - ruta que no existe
 *
 * Se registra despues de todas las rutas y antes de errorHandler
 * No responde directamente: lanza un NotFoundError y deja que el middleware de errores formatee la respuesta igual que las demas
 */
export const notFound = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  next(new NotFoundError(`Ruta ${req.originalUrl} no encontrada.`));
};
