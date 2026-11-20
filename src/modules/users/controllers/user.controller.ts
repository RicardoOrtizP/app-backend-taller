import type { Request, Response } from "express";
import type { ListUsersQueryDto, UpdateUserRoleDto } from "../dtos/users.dto";
import {
  deleteUser,
  getUserById,
  listUsers,
  updateUserRole,
} from "../services/user.service";
import type { IdParamDto } from "../../../common/dtos/id-param.dto";

export const listUsersController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const query = req.query as unknown as ListUsersQueryDto;
  res.json(await listUsers(query));
};

export const getUserByIdController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const params = req.params as unknown as IdParamDto;
  res.json(await getUserById(params));
};

export const updateUserRoleController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const params = req.params as unknown as IdParamDto;
  const dto = req.body as UpdateUserRoleDto;
  res.json(await updateUserRole(params.id, dto.role));
};

export const deleteUserController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const params = req.params as unknown as IdParamDto;
  await deleteUser(params.id);
  res.json({ message: "Usuario eliminado." });
};
