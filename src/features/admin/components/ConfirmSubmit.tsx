"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { AdminResult } from "@/features/admin/actions/vehicles";

export function ConfirmSubmit({
  action,
  label,
  confirmLabel,
  hidden,
}: {
  action: (formData: FormData) => Promise<AdminResult>;
  label: string;
  confirmLabel: string;
  hidden?: Record<string, string>;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      action={async (formData) => {
        if (!window.confirm(confirmLabel)) return;
        const result = await action(formData);
        if (!result.ok) setError(result.error);
        else router.refresh();
      }}
    >
      {hidden
        ? Object.entries(hidden).map(([name, value]) => (
            <input key={name} type="hidden" name={name} value={value} />
          ))
        : null}
      <button type="submit" className="admin-ghost">
        {label}
      </button>
      {error ? <p className="mt-2 text-sm text-accent">{error}</p> : null}
    </form>
  );
}
