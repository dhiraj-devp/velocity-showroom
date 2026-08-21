import { AdminLoginForm } from "@/features/admin/components/AdminLoginForm";
import { isAdminConfigured } from "@/features/admin/lib/password";
import { getAdminSession } from "@/features/admin/lib/session";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Desk | VELOCITY",
};

export default async function AdminLoginPage() {
  const session = await getAdminSession();
  if (session) redirect("/admin");

  return (
    <main id="main" className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-5 py-16">
      <p className="text-[0.62rem] tracking-[0.36em] text-accent uppercase">
        Private desk
      </p>
      <h1 className="font-display mt-4 text-4xl tracking-[-0.04em]">VELOCITY</h1>
      <p className="mt-4 text-sm leading-relaxed text-muted">
        {isAdminConfigured()
          ? "Sign in to review the house."
          : "Set ADMIN_EMAIL, ADMIN_PASSWORD_HASH, and ADMIN_SESSION_SECRET before signing in."}
      </p>
      <AdminLoginForm />
    </main>
  );
}
