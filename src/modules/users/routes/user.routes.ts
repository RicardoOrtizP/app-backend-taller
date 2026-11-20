import { Router } from "express";
import { authenticate } from "../../../middlewares/authenticate";
import { validateQuery } from "../../../middlewares/validate-query";
import { ListUsersQueryDto, UpdateUserRoleDto } from "../dtos/users.dto";
import { asyncHandler } from "../../../middlewares/async-handler";
import {
  deleteUserController,
  getUserByIdController,
  listUsersController,
  updateUserRoleController,
} from "../controllers/user.controller";
import { requirePermission, requireRole } from "../../../middlewares/authorize";
import { validateParams } from "../../../middlewares/validate-params";
import { IdParamDto } from "../../../common/dtos/id-param.dto";
import { getUserById } from "../services/user.service";
import { validateDto } from "../../../middlewares/validate-dto";

const router = Router();

// usa el middleware de autenticación
router.use(authenticate);

router.get(
  "/" /*,requirePermission('users:read')*/,
  validateQuery(ListUsersQueryDto),
  asyncHandler(listUsersController),
);

router.get(
  "/:id",
  validateParams(IdParamDto),
  asyncHandler(getUserByIdController),
);

router.patch(
  "/:id/role" /*, requireRole('ADMIN')*/,
  validateParams(IdParamDto),
  validateDto(UpdateUserRoleDto),
  asyncHandler(updateUserRoleController),
);

router.delete(
  "/:id" /**requireRole('ADMIN), */,
  validateParams(IdParamDto),
  asyncHandler(deleteUserController),
);
export default router;
