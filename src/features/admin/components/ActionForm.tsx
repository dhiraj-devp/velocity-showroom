"use client";

import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import type { AdminResult } from "@/features/admin/actions/vehicles";

export function ActionForm({
  action,
  children,
  className,
  success,
}: {
  action: (formData: FormData) => Promise<AdminResult>;
  children: ReactNode;
  className?: string;
  success?: string;
}) {
  const router = useRouter();
  const [result, setResult] = useState<AdminResult | null>(null);

  return (
    <form
      className={className}
      action={async (formData) => {
        setResult(null);
        const next = await action(formData);
        setResult(next);
        if (next.ok) router.refresh();
      }}
    >
      {children}
      {result && !result.ok ? (
        <p className="mt-3 text-sm text-accent" role="alert">
          {result.error}
        </p>
      ) : null}
      {result?.ok && success ? (
        <p className="mt-3 text-sm text-muted" aria-live="polite">
          {success}
        </p>
      ) : null}
    </form>
  );
}
