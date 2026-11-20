import type { Request, Response } from "express";
import type {
  ChangePasswordDto,
  LoginDto,
  RegisterUserDto,
  RequestResetPasswordDto,
  ResetPasswordDto,
} from "../dtos/auth.dto";
import {
  changePassword,
  getMe,
  login,
  logout,
  logoutAll,
  refresh,
  register,
  requestPasswordReset,
  resetPassword,
} from "../services/auth.service";
import type { SessionMeta } from "../types/auth.types";
import {
  clearRefreshCookie,
  REFRESH_COOKIE,
  setRefreshCookie,
} from "../services/refresh-cookie.service";
import { getAuthUser } from "../../../middlewares/authenticate";

function sessionMeta(req: Request): SessionMeta {
  return { userAgent: req.get("user-agent")!, ip: req.ip! };
}

function refreshFromCookie(req: Request): string | undefined {
  const cookies = (req as Request & { cookies?: Record<string, string> })
    .cookies;
  return cookies?.[REFRESH_COOKIE];
}

export const registerController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const result = await register(req.body as RegisterUserDto, sessionMeta(req));
  setRefreshCookie(res, result.refreshToken);
  res.json({ user: result.user, accessToken: result.accessToken });
};

export const loginController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const result = await login(req.body as LoginDto, sessionMeta(req));
  setRefreshCookie(res, result.refreshToken);
  res.json({ user: result.user, accessToken: result.accessToken });
};

export const refreshController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const result = await refresh(refreshFromCookie(req) ?? "", sessionMeta(req));
  setRefreshCookie(res, result.refreshToken);
  // El frontend expera solo accessToken
  res.json({ accessToken: result.accessToken });
};

export const logoutController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  console.log(req);
  await logout(refreshFromCookie(req));
  clearRefreshCookie(res);
  res.json({ message: "Sesión cerrada." });
};

export const logoutAllController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  await logoutAll(getAuthUser(res).id);
  clearRefreshCookie(res);
  res.json({ message: "Sesiones cerrada en todos los dispositivos." });
};

export const meController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  res.json(await getMe(getAuthUser(res).id));
};

export const requestResetController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  await requestPasswordReset((req.body as RequestResetPasswordDto).email);
  res.json({
    message: "Si el correo existe, recibirás el enlace de recuperación.",
  });
};

export const resetPasswordController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  await resetPassword(req.body as ResetPasswordDto);
  res.json({ message: "Contraseña actualizada. Inicia sesión de nuevo." });
};

export const changePasswordController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  await changePassword(getAuthUser(res).id, req.body as ChangePasswordDto);
  clearRefreshCookie(res);
  res.json({ message: "Contraseña actualizada. Inicia sesión de nuevo." });
};
