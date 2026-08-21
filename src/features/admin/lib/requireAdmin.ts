import { getAdminSession } from "@/features/admin/lib/session";

export async function requireAdmin() {
  const session = await getAdminSession();
  if (!session) {
    return null;
  }
  return session;
}

export function unauthorizedResult() {
  return { ok: false as const, error: "You must be signed in to the desk." };
}
