import { cookies } from "next/headers";
import { isVisitorKey, newVisitorKey, VISITOR_COOKIE } from "@/features/leads/lib/visitor";

export async function ensureVisitorKey() {
  const jar = await cookies();
  const existing = jar.get(VISITOR_COOKIE)?.value;
  if (isVisitorKey(existing)) return existing;
  const next = newVisitorKey();
  jar.set(VISITOR_COOKIE, next, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return next;
}
