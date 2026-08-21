import { scryptSync, timingSafeEqual, createHash } from "node:crypto";

export function isAdminConfigured(): boolean {
  return Boolean(
    process.env.ADMIN_EMAIL &&
      process.env.ADMIN_PASSWORD_HASH &&
      process.env.ADMIN_SESSION_SECRET,
  );
}

export function verifyAdminCredentials(email: string, password: string): boolean {
  const expectedEmail = process.env.ADMIN_EMAIL;
  const stored = process.env.ADMIN_PASSWORD_HASH;
  if (!expectedEmail || !stored) return false;
  if (email.trim().toLowerCase() !== expectedEmail.trim().toLowerCase()) {
    return false;
  }
  return verifyPassword(password, stored);
}

function verifyPassword(password: string, stored: string): boolean {
  try {
    if (stored.includes(":")) {
      const [saltHex, hashHex] = stored.split(":");
      const actual = scryptSync(password, Buffer.from(saltHex, "hex"), 64);
      const expected = Buffer.from(hashHex, "hex");
      return actual.length === expected.length && timingSafeEqual(actual, expected);
    }

    const digest = createHash("sha256").update(password).digest("hex");
    const actual = Buffer.from(digest, "hex");
    const expected = Buffer.from(stored, "hex");
    return actual.length === expected.length && timingSafeEqual(actual, expected);
  } catch {
    return false;
  }
}
