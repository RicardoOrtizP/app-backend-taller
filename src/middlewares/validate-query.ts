import { plainToInstance, type ClassConstructor } from "class-transformer";
import { validate } from "class-validator";
import type { NextFunction, Request, Response } from "express";
import { ValidationError } from "../errors/http-errors";
import { flattenClassValidatorErrors } from "../errors/validation-errors";

export function validateQuery<T extends object>(DtoClass: ClassConstructor<T>) {
  return async (
    req: Request,
    _res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const dto = plainToInstance(DtoClass, req.query);
      const errors = await validate(dto, {
        whitelist: true,
        forbidNonWhitelisted: true,
        forbidUnknownValues: true,
      });

      if (errors.length > 0) {
        throw new ValidationError(
          "Revisa los parámetros de la consulta.",
          flattenClassValidatorErrors(errors),
        );
      }
      // A partir de aquí req.query ya es una instancia tipada del DTO.
      //
      // OJO: no se puede hacer `req.query = dto`. En Express 5 `query`
      // es solo un getter (re-parsea la URL en cada acceso), y el JS
      // que compila TypeScript corre en modo estricto, así que asignar
      // revienta con `TypeError: Cannot set property query of
      // #<IncomingMessage> which has only a getter`. Tampoco sirve
      // `Object.assign(req.query, dto)`, porque el siguiente acceso
      // re-parsea y pierde lo asignado. La salida es sombrear el
      // getter con una propiedad propia del request, que es lo que
      // hace `defineProperty`. Funciona igual en Express 4.
      Object.defineProperty(req, "query", {
        value: dto,
        writable: true,
        configurable: true,
        enumerable: true,
      });
      next();
    } catch (error) {
      next(error);
    }
  };
}
