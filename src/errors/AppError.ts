export type FieldErrors =
  | Record<string, string | string[] | undefined>
  | undefined;

export class AppError extends Error {
  public readonly statusCode: number;
  // Codígo corto y estable para el frontend, ej "NOT_FOUND","CONFLICT"
  public readonly code: string;
  // Errores por campo, ej: { email: "Ya existe" } solo para 400//422
  public readonly details?: FieldErrors;
  // true = error previsto (404, 409 validacion...) false = bug =500
  public readonly isOperational: boolean;

  constructor(
    message: string,
    statusCode = 500,
    code = "INTERNAL_ERROR",
    details?: FieldErrors,
  ) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = statusCode < 500;

    // Mantiene el stack limpio (sin el constructor en la traza)
  }
}
