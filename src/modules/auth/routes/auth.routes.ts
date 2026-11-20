import { Router } from "express";
import { validateDto } from "../../../middlewares/validate-dto";
import {
  ChangePasswordDto,
  LoginDto,
  RegisterUserDto,
  RequestResetPasswordDto,
  ResetPasswordDto,
} from "../dtos/auth.dto";
import { asyncHandler } from "../../../middlewares/async-handler";
import {
  changePasswordController,
  loginController,
  logoutAllController,
  logoutController,
  meController,
  refreshController,
  registerController,
  requestResetController,
  resetPasswordController,
} from "../controllers/auth.controller";
import { authenticate } from "../../../middlewares/authenticate";

const router = Router();

router.post(
  "/register",
  validateDto(RegisterUserDto),
  asyncHandler(registerController),
);
router.post("/login", validateDto(LoginDto), asyncHandler(loginController));
router.post("/refresh", asyncHandler(refreshController));
router.post("/logout", asyncHandler(logoutController));
router.post("/logout-all", authenticate, asyncHandler(logoutAllController));
router.get("/me", authenticate, asyncHandler(meController));

router.post(
  "/forgot-password",
  validateDto(RequestResetPasswordDto),
  asyncHandler(requestResetController),
);
router.post(
  "/reset-password",
  validateDto(ResetPasswordDto),
  asyncHandler(resetPasswordController),
);
router.post(
  "/change-password",
  authenticate,
  validateDto(ChangePasswordDto),
  asyncHandler(changePasswordController),
);

export default router;
