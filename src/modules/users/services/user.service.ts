import type { IdParamDto } from "../../../common/dtos/id-param.dto";
import { pageSkip, toPage, type Page } from "../../../common/pagination";
import { escapeLike } from "../../../common/utils/escape";
import { AppDataSource } from "../../../config/data-source";
import { NotFoundError } from "../../../errors/http-errors";
import { toPublicUser } from "../../auth/services/auth.service";
import type { PublicUser, Role } from "../../auth/types/auth.types";
import type { ListUsersQueryDto } from "../dtos/users.dto";
import { UserEntity } from "../entities/user.entity";

function users() {
  return AppDataSource.getRepository(UserEntity);
}

export async function listUsers(
  query: ListUsersQueryDto,
): Promise<Page<PublicUser>> {
  const { page, limit, search, role, sortBy, sortOrder } = query;
  //   console.log("datos de query", JSON.stringify(query));
  const qb = users().createQueryBuilder("user");

  if (search) {
    const term = `%${escapeLike(search.trim())}%`;
    qb.andWhere(`(user.name ILIKE :term OR user.email ILIKE :term)`, { term });
  }
  if (role) {
    qb.andWhere("user.role = :role", { role });
  }
  qb.orderBy(`user.${sortBy}`, sortOrder).addOrderBy("user.id", "ASC");

  const [all, total] = await qb
    .skip(pageSkip(page, limit))
    .take(limit)
    .getManyAndCount();
  return toPage(all.map(toPublicUser), total, page, limit);
}

export async function getUserById(dto: IdParamDto): Promise<PublicUser> {
  const user = await users().findOneBy({ id: dto.id });
  if (!user) {
    throw new NotFoundError("Usuario no encontrado");
  }
  return toPublicUser(user);
}

export async function updateUserRole(
  id: string,
  role: Role,
): Promise<PublicUser> {
  const user = await users().findOneBy({ id });
  if (!user) throw new NotFoundError("Usuario no encontrado.");
  user.role = role;
  await users().save(user);
  return toPublicUser(user);
}

export async function deleteUser(id: string): Promise<void> {
  const user = await users().findOneBy({ id: id });
  if (!user) {
    throw new NotFoundError("Usuario no encontrado.");
  }
  await users().softDelete(id);
}
