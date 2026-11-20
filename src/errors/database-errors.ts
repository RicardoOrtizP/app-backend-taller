import { EntityNotFoundError, QueryFailedError } from "typeorm";
import { AppError } from "./AppError";
import { BadRequestError, ConflictError, NotFoundError } from "./http-errors";

/**
 * Traductor TypeORM / PostgreSQL -> HTTP.
 *
 * TypeORM lanza `QueryFailedError` con el error de Postgres dentro
 * (`driverError.code`). Cada código de Postgres tiene un significado
 * y le corresponde un HTTP distinto. Esta es la tabla que importa:
 *
 *   Código PG | Significado                          | HTTP
 *   ----------|--------------------------------------|------
 *   23505     | unique_violation (email duplicado)   | 409 Conflict
 *   23503     | foreign_key_violation                | 409 Conflict
 *   23502     | not_null_violation                   | 400 Bad Request
 *   23514     | check_violation                      | 400 Bad Request
 *   22P02     | invalid_text_representation (UUID    | 400 Bad Request
 *             |   inválido, ej. /users/abc)          |
 *   22001     | string_data_right_truncation         | 400 Bad Request
 *
 * Sin este traductor, un email duplicado llegaría al cliente como un
 * 500 genérico con el mensaje crudo de Postgres. Con él, llega como
 * un 409 limpio que tu frontend ya sabe mostrar con sileo.
 */

type PostgresDriverError = Error & {
  code?: string;
  detail?: string;
  constraint?: string;
};

function isPostgresError(error: unknown): error is PostgresDriverError {
  return typeof error === "object" && error !== null && "code" in error;
}

/**
 * Postgres dice: `Key (email)=(ana@mail.com) already exists.`
 * Extraemos el campo para devolver `errors: { email: "..." }`
 * y que react-hook-form pueda marcar el campo exacto.
 */
function fieldFromUniqueDetail(detail?: string): string | undefined {
  const match = detail?.match(/Key \((\w+)\)=/);
  return match?.[1];
}

export function translateDatabaseError(error: unknown): AppError | null {
  // TypeORM: findOneOrFail() / findOneByOrFail() sin resultado.
  if (error instanceof EntityNotFoundError) {
    return new NotFoundError("Recurso no encontrado.");
  }

  if (error instanceof QueryFailedError) {
    const pg = error.driverError as PostgresDriverError;

    if (isPostgresError(pg)) {
      switch (pg.code) {
        case "23505": {
          const field = fieldFromUniqueDetail(pg.detail);
          return new ConflictError(
            field
              ? `Ya existe un registro con ese ${field}.`
              : "Ya existe un registro con esos datos.",
            field
              ? { [field]: "Ya existe un registro con este valor." }
              : undefined,
          );
        }
        case "23503":
          return new ConflictError(
            "No se puede realizar la operación porque el registro está relacionado con otros datos.",
          );
        case "23502":
          return new BadRequestError("Falta un campo obligatorio.");
        case "23514":
          return new BadRequestError(
            "Los datos no cumplen con las reglas permitidas.",
          );
        case "22P02":
          return new BadRequestError(
            "El formato de uno de los datos no es válido.",
          );
        case "22001":
          return new BadRequestError("Uno de los datos es demasiado largo.");
        default:
          // Código PG no mapeado: no filtramos el mensaje crudo al cliente.
          return null;
      }
    }
  }

  return null;
}
