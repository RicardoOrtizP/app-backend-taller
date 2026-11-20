export type Role = "ADMIN" | "USER" | "DEV";
export const ROLES: readonly Role[] = [
  "ADMIN",
  //   "MANAGER",
  "DEV",
  "USER",
] as const;

/**
 * Permiso con formato `recurso:accion`
 */
export type Permission =
  | "users:read"
  | "users:create"
  | "users:update"
  | "users:delete"
  | "orders:read"
  | "orders:confirm"
  | "orders:create"
  | "orders:update"
  | "orders:delete"
  | "profile:update"
  | "customer:read"
  | "customer:create"
  | "customer:update"
  | "customer:delete";

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  ADMIN: [
    "users:read",
    "users:create",
    "users:update",
    "users:delete",
    "orders:read",
    "orders:confirm",
    "orders:create",
    "orders:update",
    "orders:delete",
    "profile:update",
    "customer:read",
    "customer:create",
    "customer:update",
    "customer:delete",
  ],
  USER: [
    "users:update",
    "profile:update",
    "orders:read",
    "orders:create",
    "orders:update",
    "orders:confirm",
    // 'orders:delete',
  ],
  DEV: [
    "users:read",
    "users:create",
    "users:update",
    "users:delete",
    "orders:read",
    "orders:confirm",
    "orders:create",
    "orders:update",
    "orders:delete",
    "profile:update",
    "customer:read",
    "customer:create",
    "customer:update",
    "customer:delete",
  ],
};

export function permissionsFor(role: Role): Permission[] {
  return ROLE_PERMISSIONS[role] ?? [];
}

export function hasPermission(role: Role, permission: Permission): boolean {
  return permissionsFor(role).includes(permission);
}

export function hasAnyPermission(
  role: Role,
  permissions: Permission[],
): boolean {
  return permissions.some((p) => hasPermission(role, p));
}

export function hasAllPermissions(
  role: Role,
  permissions: Permission[],
): boolean {
  return permissions.every((p) => hasPermission(role, p));
}

// Payload que va dentro del access token, Solo role, nunca permisos
export interface AccessTokenPayload {
  sub: string; // user.id
  email: string;
  role: Role;
}

// Usuario autenticado que deja 'authenticate' en 'res.locals.user'
export interface AuthUser {
  id: string;
  email: string;
  role: Role;
  permissions: Permission[];
}

/**Usuario tal como se devuelve al frontend. Nunca incluye el hash */
export interface PublicUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  isActive: boolean;
  createdAt: Date;
}

export interface AuthResult {
  user: PublicUser;
  accessToken: string;
  // El token en claro, solo se pone en la cookie httpOnly
  refreshToken: string;
}
export interface SessionMeta {
  userAgent?: string;
  ip?: string;
}
