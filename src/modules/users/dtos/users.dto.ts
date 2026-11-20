import { IsIn, IsOptional, IsString, MaxLength } from "class-validator";
import { ROLES, type Role } from "../../auth/types/auth.types";
import { PaginationQueryDto } from "../../../common/dtos/pagination.dto";

export class ListUsersQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString({ message: "La búsqueda debe ser texto." })
  @MaxLength(100, {
    message: "La búsqueda no puede tener más de 100 caracteres.",
  })
  search?: string;

  @IsOptional()
  @IsIn([...ROLES], { message: "Rol no válido. Usa ADMIN, DEV o USER" })
  role?: Role;

  @IsOptional()
  @IsIn(["name", "email", "createdAt"], {
    message: "Solo se puede ordenar por name, email o createdAt.",
  })
  sortBy: "name" | "email" | "createdAt" = "createdAt";

  @IsOptional()
  @IsIn(["ASC", "DESC"], { message: "El orden debe ser ASC o DESC." })
  sortOrder: "ASC" | "DESC" = "ASC";
}

export class UpdateUserRoleDto {
  @IsString({ message: "El rol debe ser texto." })
  @IsIn([...ROLES], { message: "Rol no válido. Usa ADMIN, DEV o USER." })
  role!: Role;
}
