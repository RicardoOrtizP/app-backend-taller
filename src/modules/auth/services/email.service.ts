const NODE_ENV = process.env.NODE_ENV as string;
const FRONTEND_URL = process.env.FRONTEND_URL as string;
export async function sendPasswordResetEmail(
  to: string,
  resetUrl: string,
): Promise<void> {
  if (NODE_ENV === "production") {
    // TODO: conectar proveedor real. No loguear el enlace en producción.
    console.warn(`[email] TODO proveedor real: enviar enlace de reset a ${to}`);
    return;
  }
  console.log(`[email] Recuperación para ${to}: ${resetUrl}`);
}

export function buildResetUrl(token: string): string {
  return `${FRONTEND_URL}/reset-password?token=${token}`;
}
