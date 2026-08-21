"use server";

import { redirect } from "next/navigation";
import {
  isAdminConfigured,
  verifyAdminCredentials,
} from "@/features/admin/lib/password";
import { clearAdminSession, setAdminSession } from "@/features/admin/lib/session";

export async function loginAdmin(
  _previous: { error?: string } | undefined,
  formData: FormData,
): Promise<{ error?: string }> {
  if (!isAdminConfigured()) {
    return {
      error:
        "Admin credentials are not configured. Set ADMIN_EMAIL, ADMIN_PASSWORD_HASH, and ADMIN_SESSION_SECRET.",
    };
  }

  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  if (!verifyAdminCredentials(email, password)) {
    return { error: "Those credentials were not accepted." };
  }

  await setAdminSession(email.trim().toLowerCase());
  redirect("/admin");
}

export async function logoutAdmin() {
  await clearAdminSession();
  redirect("/admin/login");
}
