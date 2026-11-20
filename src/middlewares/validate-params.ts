import { plainToInstance, type ClassConstructor } from "class-transformer";
import { validate } from "class-validator";
import type { NextFunction, Request, Response } from "express";
import { ValidationError } from "../errors/http-errors";
import { flattenClassValidatorErrors } from "../errors/validation-errors";

export function validateParams<T extends object>(
  DtoClass: ClassConstructor<T>,
) {
  return async (
    req: Request,
    _res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const dto = plainToInstance(DtoClass, req.params);
      const errors = await validate(dto, {
        whitelist: true,
        forbidNonWhitelisted: true,
        forbidUnknownValues: true,
      });

      if (errors.length > 0) {
        throw new ValidationError(
          "Revisa los parámetros de la URL.",
          flattenClassValidatorErrors(errors),
        );
      }
      // A partir de aqui req.params ya es una instancia tipada del DTO
      req.params = dto as unknown as typeof req.params;
      next();
    } catch (error) {
      next(error);
    }
  };
}
