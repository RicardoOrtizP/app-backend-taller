import { IsIn, IsOptional, IsString, MaxLength } from "class-validator";
import { PaginationQueryDto } from "../../../common/dtos/pagination.dto";

export class ListCustomersQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString({ message: "La búsqueda debe ser texto." })
  @MaxLength(100, {
    message: "La búsqueda no puede tener más de 100 caracteres.",
  })
  search?: string;

  @IsOptional()
  @IsIn(["name", "phone", "createdAt"], {
    message: "Solo se puede ordenar por nombre, email o fecha de registro.",
  })
  sortBy: "name" | "phone" | "createdAt" = "createdAt";

  @IsOptional()
  @IsIn(["ASC", "DESC"], { message: "El orden debe ser ASC o DESC" })
  sortOrder: "ASC" | "DESC" = "ASC";
}
