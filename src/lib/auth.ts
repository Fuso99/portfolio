import { jwtVerify, SignJWT } from "jose";

export const SESSION_COOKIE = "portfolio_admin";
export const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;

function secretKey() {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) return null;
  return new TextEncoder().encode(secret);
}

export function isAuthConfigured() {
  return Boolean(secretKey() && process.env.ADMIN_PASSWORD);
}

export async function createSessionToken() {
  const key = secretKey();
  if (!key) throw new Error("AUTH_SECRET mancante o più corto di 32 caratteri");
  return new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .sign(key);
}

export async function verifySessionToken(token: string | undefined) {
  const key = secretKey();
  if (!token || !key) return false;
  try {
    const { payload } = await jwtVerify(token, key, { algorithms: ["HS256"] });
    return payload.role === "admin";
  } catch {
    return false;
  }
}
