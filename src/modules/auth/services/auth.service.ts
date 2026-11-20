import { IsNull } from "typeorm";
import { AppDataSource } from "../../../config/data-source";
import {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
} from "../../../errors/http-errors";
import { UserEntity } from "../../users/entities/user.entity";
import type {
  ChangePasswordDto,
  LoginDto,
  RegisterUserDto,
  ResetPasswordDto,
} from "../dtos/auth.dto";
import { RefreshTokenEntity } from "../entities/refresh-token.entity";
import type { AuthResult, PublicUser, SessionMeta } from "../types/auth.types";
import { comparePassword, hashPassword } from "./password.service";
import {
  generateRefreshToken,
  generateResetToken,
  hashToken,
  refreshTokenExpiresAt,
  resetTokenExpiresAt,
  signAccessToken,
} from "./token.service";
import { buildResetUrl, sendPasswordResetEmail } from "./email.service";

export function toPublicUser(user: UserEntity): PublicUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
    createdAt: user.createdAt,
  };
}

// Mensajes constantes
const INVALID_SESSION_MESSAGE = "Sesión inválida. Inicia sesión de nuevo.";
const WRONG_CREDENTIALS_MESSAGE = "Correo o contraseña incorrectos.";

// Repositorios
function users() {
  return AppDataSource.getRepository(UserEntity);
}
function refreshTokens() {
  return AppDataSource.getRepository(RefreshTokenEntity);
}

async function issueSession(
  user: UserEntity,
  meta: SessionMeta,
): Promise<AuthResult> {
  const publicUser = toPublicUser(user);
  const refreshToken = generateRefreshToken();

  const refreshTokenCreated = await refreshTokens().create({
    tokenHash: hashToken(refreshToken),
    userId: user.id,
    expiresAt: refreshTokenExpiresAt(),
    userAgent: meta.userAgent ?? null,
    ip: meta.ip ?? null,
  });
  await refreshTokens().save(refreshTokenCreated);
  return {
    user: publicUser,
    accessToken: signAccessToken(publicUser),
    refreshToken: refreshToken,
  };
}

async function revokeAllSessions(userId: string): Promise<void> {
  await refreshTokens()
    .createQueryBuilder()
    .update(RefreshTokenEntity)
    .set({ revokedAt: new Date() })
    .where("userId = :userId AND revokedAt IS NULL", { userId })
    .execute();
}

// Registro publico: siempre USER, nunca recibe el rol
export async function register(
  dto: RegisterUserDto,
  meta: SessionMeta,
): Promise<AuthResult> {
  const existingUser = await users().findOneBy({ email: dto.email });
  if (existingUser) {
    // 409, y con el mismo mensaje de postgres
    throw new ConflictError("Ya existe una cuenta con ese correo.", {
      email: "Ya existe una cuenta con ese correo.",
    });
  }

  const user = await users().save(
    users().create({
      name: dto.name,
      email: dto.email,
      passwordHash: await hashPassword(dto.password),
      role: "USER",
    }),
  );
  return issueSession(user, meta);
}

export async function login(
  dto: LoginDto,
  meta: SessionMeta,
): Promise<AuthResult> {
  // passwordHash tiene select:false hay que pedirlo explicito
  const user = await users()
    .createQueryBuilder("user")
    .addSelect("user.passwordHash")
    .where("user.email = :email", { email: dto.email })
    .getOne();

  // Mensaje generico a proposito no reveloa si falla el correo o contraseña
  if (!user || !user.isActive) {
    throw new UnauthorizedError(WRONG_CREDENTIALS_MESSAGE);
  }
  if (!(await comparePassword(dto.password, user.passwordHash))) {
    throw new UnauthorizedError(WRONG_CREDENTIALS_MESSAGE);
  }
  return issueSession(user, meta);
}

export async function refresh(
  rawToken: string,
  meta: SessionMeta,
): Promise<AuthResult> {
  if (!rawToken) throw new UnauthorizedError(INVALID_SESSION_MESSAGE);

  const tokenHash = hashToken(rawToken);
  const stored = await refreshTokens().findOne({
    where: { tokenHash },
    relations: { user: true },
  });

  if (!stored) throw new UnauthorizedError(INVALID_SESSION_MESSAGE);

  if (stored.revokedAt) {
    // Si el token ya tiene fecha de revocacion se revoca la sesión
    await revokeAllSessions(stored.userId);
    throw new UnauthorizedError(INVALID_SESSION_MESSAGE);
  }

  // Si el token ya expiró o el usuario asociado al token no esta activo
  if (stored.expiresAt.getTime() < Date.now() || !stored.user.isActive) {
    throw new UnauthorizedError("Sesión expirada. Inicia sesión de nuevo.");
  }

  const newRefreshToken = generateRefreshToken();
  stored.revokedAt = new Date(); // establecer AHORA como fecha de revocacion del token
  stored.replacedByTokenHash = hashToken(newRefreshToken); // establecer por que token fue reemplazado
  await refreshTokens().save(stored);
  await refreshTokens().save(
    refreshTokens().create({
      tokenHash: hashToken(newRefreshToken),
      userId: stored.userId,
      expiresAt: refreshTokenExpiresAt(),
      userAgent: meta.userAgent ?? null,
      ip: meta.ip ?? null,
    }),
  );

  const publicUser = toPublicUser(stored.user);
  return {
    user: publicUser,
    accessToken: signAccessToken(publicUser),
    refreshToken: newRefreshToken,
  };
}

export async function logout(rawToken: string | undefined): Promise<void> {
  if (!rawToken) return;

  console.log("token", rawToken);
  await refreshTokens().update(
    { tokenHash: hashToken(rawToken), revokedAt: IsNull() },
    { revokedAt: new Date() },
  );
}

export async function logoutAll(userId: string): Promise<PublicUser> {
  const user = await users().findOneBy({ id: userId });
  if (!user || !user.isActive)
    throw new NotFoundError("Usuario no encontrado.");
  return toPublicUser(user);
}

export async function requestPasswordReset(email: string): Promise<void> {
  const user = await users().findOneBy({ email });
  if (!user || !user.isActive) return;

  const token = generateResetToken();
  user.passwordResetTokenHash = hashToken(token);
  user.passwordResetExpiresAt = resetTokenExpiresAt();
  await users().save(user);
  await sendPasswordResetEmail(user.email, buildResetUrl(token));
}

export async function resetPassword(dto: ResetPasswordDto): Promise<void> {
  const tokenHash = hashToken(dto.token);
  const user = await users()
    .createQueryBuilder("user")
    .addSelect("user.passwordResetTokenHash")
    .where("user.passwordResetTokenHash = :tokenHash", { tokenHash })
    .getOne();

  if (
    !user ||
    !user.passwordResetExpiresAt ||
    user.passwordResetExpiresAt.getTime() < Date.now()
  ) {
    throw new BadRequestError(
      "El enlace de recuperación no es válido o ya expiró.",
    );
  }

  user.passwordHash = await hashPassword(dto.password);
  user.passwordResetTokenHash = null;
  user.passwordResetExpiresAt = null;
  await users().save(user);
  // La contraseña cambio cerrar todas las sesiónes.
  await revokeAllSessions(user.id);
}

export async function changePassword(
  userId: string,
  dto: ChangePasswordDto,
): Promise<void> {
  const user = await users()
    .createQueryBuilder("user")
    .addSelect("user.passwordHash")
    .where("user.id = :id", { id: userId })
    .getOne();
  if (!user) throw new NotFoundError("Usuario no encontrado.");
  if (!(await comparePassword(dto.currentPassword, user.passwordHash))) {
    throw new ForbiddenError("La contraseña actual no es correcta.");
  }
  if (dto.currentPassword === dto.newPassword) {
    throw new BadRequestError(
      "La nueva contraseña debe ser diferente a la actual.",
    );
  }
  user.passwordHash = await hashPassword(dto.newPassword);
  await users().save(user);
  await revokeAllSessions(user.id);
}

export async function getMe(userId: string): Promise<PublicUser> {
  const user = await users().findOneBy({ id: userId });
  if (!user || !user.isActive)
    throw new NotFoundError("Usuario no encontrado.");
  return toPublicUser(user);
}
