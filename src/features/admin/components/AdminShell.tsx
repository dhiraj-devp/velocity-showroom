"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAdmin } from "@/features/admin/actions";
import { cn } from "@/lib/cn";
import type { ReactNode } from "react";

const LINKS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/vehicles", label: "Vehicles" },
  { href: "/admin/leads", label: "Leads" },
  { href: "/admin/follow-ups", label: "Follow-ups" },
  { href: "/admin/viewings", label: "Viewings" },
  { href: "/admin/catalog", label: "Brands & Models" },
  { href: "/admin/settings", label: "Settings" },
] as const;

export function AdminShell({
  dealershipName,
  email,
  children,
}: {
  dealershipName: string;
  email: string;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <div className="admin-shell">
      <header className="admin-topbar">
        <p className="font-display text-sm tracking-[0.28em]">
          {dealershipName} <span className="text-muted">/ DESK</span>
        </p>
        <div className="flex items-center gap-4">
          <p className="hidden text-[0.58rem] tracking-[0.2em] text-muted uppercase sm:block">
            {email}
          </p>
          <form action={logoutAdmin}>
            <button type="submit" className="text-[0.58rem] tracking-[0.22em] text-muted uppercase">
              Sign out
            </button>
          </form>
          <button
            type="button"
            className="text-[0.58rem] tracking-[0.22em] uppercase lg:hidden"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
          >
            Menu
          </button>
        </div>
      </header>

      <aside className={cn("admin-sidebar", open && "is-open")}>
        <nav aria-label="Desk">
          <ul className="flex flex-col gap-1">
            {LINKS.map((link) => {
              const active =
                link.href === "/admin"
                  ? pathname === "/admin"
                  : pathname.startsWith(link.href);
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={cn("admin-nav-link", active && "is-active")}
                    onClick={() => setOpen(false)}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>

      <div className="admin-main">{children}</div>
    </div>
  );
}
