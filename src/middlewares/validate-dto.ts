import { plainToInstance, type ClassConstructor } from "class-transformer";
import type { NextFunction, Request, Response } from "express";
import { ValidationError } from "../errors/http-errors";
import { validate } from "class-validator";
import { flattenClassValidatorErrors } from "../errors/validation-errors";

export function validateDto<T extends object>(DtoClass: ClassConstructor<T>) {
  return async (
    req: Request,
    _res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      // Sin body no hay nada que validar: `plainToInstance(Dto, undefined)`
      // devuelve `undefined` y `validate(undefined)` revienta dentro de
      // class-validator con `Cannot read properties of undefined
      // (reading 'constructor')`. Eso pasa cuando falta `express.json()`
      // antes de las rutas o el cliente no manda JSON. Mejor un 422
      // claro que un 500.
      if (
        !req.body ||
        typeof req.body !== "object" ||
        Array.isArray(req.body)
      ) {
        throw new ValidationError("Revisa los datos del formulario.", {
          body: "El cuerpo de la petición debe ser un JSON.",
        });
      }

      const dto = plainToInstance(DtoClass, req.body);
      const errors = await validate(dto, {
        whitelist: true,
        forbidNonWhitelisted: true,
        forbidUnknownValues: true,
      });

      if (errors.length > 0) {
        throw new ValidationError(
          "Revisa los datos del formulario.",
          flattenClassValidatorErrors(errors),
        );
      }
      // A partir de aquí req.body ya es una instancia tipada del DTO
      req.body = dto;
      next();
    } catch (error) {
      next(error);
    }
  };
}
