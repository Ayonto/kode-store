import "server-only";
import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { prisma } from "./db";

const COOKIE_NAME = "kode_admin";
const secret = new TextEncoder().encode(
  process.env.AUTH_SECRET || "kode_dev_fallback_secret"
);

export type AdminSession = { id: number; username: string };

async function createToken(payload: AdminSession): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
}

/** Verify credentials and set the session cookie. Returns null on success, message on failure. */
export async function login(
  username: string,
  password: string
): Promise<string | null> {
  const admin = await prisma.admin.findUnique({
    where: { username: username.trim().toLowerCase() },
  });
  if (!admin) return "Invalid username or password.";
  const ok = await bcrypt.compare(password, admin.passwordHash);
  if (!ok) return "Invalid username or password.";

  const token = await createToken({ id: admin.id, username: admin.username });
  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return null;
}

export async function logout() {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

export async function getSession(): Promise<AdminSession | null> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    return { id: Number(payload.id), username: String(payload.username) };
  } catch {
    return null;
  }
}

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10);
}
