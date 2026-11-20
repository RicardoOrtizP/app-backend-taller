import { IsEmail, IsString, MaxLength, MinLength } from "class-validator";

export class RegisterUserDto {
  @IsString({ message: "El nombre debe ser texto." })
  @MinLength(3, { message: "El nombre debe tener mínimo 3 caracteres." })
  @MaxLength(150, { message: "El nombre debe tener máximo 150 caracteres." })
  name!: string;

  @IsEmail({}, { message: "Correo inválido" })
  email!: string;

  @IsString({ message: "La contraseña debe ser texto." })
  @MinLength(8, { message: "La contraseña debe tener mínimo 8 caracteres." })
  @MaxLength(128, {
    message: "La contraseña debe tener máximo 128 caracteres.",
  })
  password!: string;
}

export class LoginDto {
  @IsEmail({}, { message: "Correo invalido." })
  email!: string;

  @IsString({ message: "La contraseña es obligatoria." })
  password!: string;
}

export class RequestResetPasswordDto {
  @IsEmail({}, { message: "Correo inválido." })
  email!: string;
}

export class ResetPasswordDto {
  @IsString({ message: "El token debe ser texto." })
  @MinLength(32, { message: "El token no es válido." })
  token!: string;

  @IsString({ message: "La contraseña debe ser texto." })
  @MinLength(8, { message: "La contraseña debe tener mínimo 8 caracteres." })
  @MaxLength(128, {
    message: "La contraseña debe tener máximo 128 caracteres.",
  })
  password!: string;
}

export class ChangePasswordDto {
  @IsString({ message: "La contraseña actual es obligatoria." })
  currentPassword!: string;

  @IsString({ message: "La nueva contraseña debe ser texto." })
  @MinLength(8, {
    message: "La nueva contraseña debe tener mínimo 8 caracteres.",
  })
  @MaxLength(128, {
    message: "La nueva contraseña debe tener máximo 128 caracteres.",
  })
  newPassword!: string;
}
