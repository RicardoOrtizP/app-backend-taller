import { AppError, type FieldErrors } from "./AppError";

// 400 - datos mal formados o invalidos (sin ser error de validacion por campo)
export class BadRequestError extends AppError {
  constructor(
    message = "Los datos enviados no son validos",
    details?: FieldErrors,
  ) {
    super(message, 400, "BAD_REQUEST", details);
  }
}
// 401 - No autenticado: falta token, token invalido o credenciales incorrectas
export class UnauthorizedError extends AppError {
  constructor(message = "No autenticado. Inicia sesión de nuevo.") {
    super(message, 401, "UNAUTHORIZED");
  }
}
// 402 - Autenticado, pero sin permiso para este recurso
export class ForbiddenError extends AppError {
  constructor(message = "No tiene permiso para realizar esta acción.") {
    super(message, 403, "FORBIDDEN");
  }
}
// 404 - Recurso no encontrado
export class NotFoundError extends AppError {
  constructor(message = "Recurso no encontrado.") {
    super(message, 404, "NOT_FOUND");
  }
}

// 409 - Conflicto: el recurso ya existe o choca con el estado actual.
// es el codigo indicado para un email duplicado, no un 400
export class ConflictError extends AppError {
  constructor(message = "El recurso ya existe.", details?: FieldErrors) {
    super(message, 409, "CONFLICT", details);
  }
}

// 422 - Validación por campo (zod, class-validator) lleva details
export class ValidationError extends AppError {
  constructor(
    message = "Revisa los datos del formulario.",
    details?: FieldErrors,
  ) {
    super(message, 422, "VALIDATION_ERROR", details);
  }
}

// 429 - Demasiadas peticiones
export class TooManyRequestsError extends AppError {
  constructor(message = "Demasiadas peticiones. Inténtalo más tarde.") {
    super(message, 429, "TOO_MANY_REQUESTS");
  }
}

/// 500 - Erro del servidor. No des detalles al cliente
export class InternalServerError extends AppError {
  constructor(message = "Error interno del servidor. Intentalo de nuevo.") {
    super(message, 500, "INTERNAL_ERROR");
  }
}
