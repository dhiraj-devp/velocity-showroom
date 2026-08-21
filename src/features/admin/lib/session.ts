import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const ADMIN_COOKIE = "velocity_admin";
const MAX_AGE_SECONDS = 60 * 60 * 12;

function secret() {
  const value = process.env.ADMIN_SESSION_SECRET;
  if (!value) {
    throw new Error("ADMIN_SESSION_SECRET is not configured.");
  }
  return value;
}

function sign(payload: string) {
  return createHmac("sha256", secret()).update(payload).digest("hex");
}

export function createAdminToken(email: string): string {
  const exp = Date.now() + MAX_AGE_SECONDS * 1000;
  const payload = Buffer.from(JSON.stringify({ email, exp }), "utf8").toString(
    "base64url",
  );
  return `${payload}.${sign(payload)}`;
}

export function readAdminEmail(token: string): string | null {
  const splitAt = token.lastIndexOf(".");
  if (splitAt <= 0) return null;
  const payload = token.slice(0, splitAt);
  const signature = token.slice(splitAt + 1);
  const expected = sign(payload);
  const actualBuf = Buffer.from(signature);
  const expectedBuf = Buffer.from(expected);
  if (actualBuf.length !== expectedBuf.length || !timingSafeEqual(actualBuf, expectedBuf)) {
    return null;
  }

  try {
    const parsed = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8"),
    ) as { email?: string; exp?: number };
    if (!parsed.email || !parsed.exp || Date.now() > parsed.exp) return null;
    return parsed.email;
  } catch {
    return null;
  }
}

export async function getAdminSession(): Promise<{ email: string } | null> {
  const jar = await cookies();
  const token = jar.get(ADMIN_COOKIE)?.value;
  if (!token) return null;
  try {
    const email = readAdminEmail(token);
    return email ? { email } : null;
  } catch {
    return null;
  }
}

export async function setAdminSession(email: string) {
  const jar = await cookies();
  jar.set(ADMIN_COOKIE, createAdminToken(email), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function clearAdminSession() {
  const jar = await cookies();
  jar.delete(ADMIN_COOKIE);
}
