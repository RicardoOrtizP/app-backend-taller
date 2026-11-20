import { IsString, Matches, MaxLength, MinLength } from "class-validator";

export class RegisterCustomerDto {
  @IsString({ message: "El nombre debe ser texto." })
  @MinLength(3, { message: "El nombre debe tener mínimo 3 caracteres." })
  @MaxLength(150, { message: "El nombre debe tener máximo 150 caracteres." })
  name!: string;

  @Matches(/^\d{10}$/, { message: "Formato de número de telefono incorrecto." })
  phone!: string;
}
