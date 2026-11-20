import type { ValidationError as ClassValidatorError } from "class-validator";
import type { FieldErrors } from "./AppError";

export function flattenClassValidatorErrors(
  errors: ClassValidatorError[],
  prefix = "",
): FieldErrors {
  const details: FieldErrors = {};

  for (const error of errors) {
    const field = prefix ? `${prefix}.${error.property}` : error.property;

    if (error.constraints) {
      // forbidNonWhiteListed genera property X should not exists en ingles
      details[field] = error.constraints.whitelistValidation
        ? "Este campo no está permitido."
        : Object.values(error.constraints)[0];
    }

    if (error.children?.length) {
      Object.assign(
        details,
        flattenClassValidatorErrors(error.children, field),
      );
    }
  }
  return details;
}

export function isClassValidatorErrors(
  value: unknown,
): value is ClassValidatorError[] {
  return (
    Array.isArray(value) &&
    value.length > 0 &&
    typeof value[0] === "object" &&
    value[0] !== null &&
    "property" in value[0] &&
    "constraints" in value[0]
  );
}
