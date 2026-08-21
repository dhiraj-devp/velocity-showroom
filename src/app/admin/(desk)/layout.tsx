import { AdminShell } from "@/features/admin/components/AdminShell";
import { getAdminSession } from "@/features/admin/lib/session";
import { dealershipRepository } from "@/features/dealership/repository/dealershipRepository";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";

export default async function AdminDeskLayout({ children }: { children: ReactNode }) {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  const dealership = await dealershipRepository.get();

  return (
    <AdminShell dealershipName={dealership.name} email={session.email}>
      {children}
    </AdminShell>
  );
}
