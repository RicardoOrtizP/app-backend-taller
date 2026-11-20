import { Matches } from "class-validator";

export class PhoneParamDto {
  @Matches(/^\d{10}$/, { message: "Formato de número de telefono incorrecto." })
  phone!: string;
}
