"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ActionForm } from "@/features/admin/components/ActionForm";
import {
  clearLeadFollowUpAction,
  markLeadContactedAction,
  openWhatsAppFollowUpAction,
  scheduleLeadFollowUpPresetAction,
} from "@/features/admin/actions/leads";
import { canMessageLeadOnWhatsApp } from "@/features/leads/lib/customerWhatsApp";
import type { Lead } from "@/features/leads/types";

export function LeadOpsMenu({ lead }: { lead: Lead }) {
  const canWhatsApp = canMessageLeadOnWhatsApp(lead);

  return (
    <details className="lead-ops-menu">
      <summary>Actions</summary>
      <div className="lead-ops-panel">
        <ActionForm action={markLeadContactedAction}>
          <input type="hidden" name="id" value={lead.id} />
          <button type="submit" className="admin-ghost">
            Mark contacted
          </button>
        </ActionForm>
        <ActionForm action={scheduleLeadFollowUpPresetAction}>
          <input type="hidden" name="id" value={lead.id} />
          <input type="hidden" name="preset" value="tomorrow" />
          <button type="submit" className="admin-ghost">
            Follow up tomorrow
          </button>
        </ActionForm>
        <ActionForm action={scheduleLeadFollowUpPresetAction}>
          <input type="hidden" name="id" value={lead.id} />
          <input type="hidden" name="preset" value="next_week" />
          <button type="submit" className="admin-ghost">
            Follow up next week
          </button>
        </ActionForm>
        <ActionForm action={clearLeadFollowUpAction}>
          <input type="hidden" name="id" value={lead.id} />
          <button type="submit" className="admin-ghost">
            Clear follow-up
          </button>
        </ActionForm>
        <Link href={`/admin/leads/${lead.id}`} className="admin-ghost lead-ops-link">
          Open lead
        </Link>
        {canWhatsApp ? <WhatsAppCustomerButton leadId={lead.id} /> : null}
      </div>
    </details>
  );
}

function WhatsAppCustomerButton({ leadId }: { leadId: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      action={async (formData) => {
        setError(null);
        const result = await openWhatsAppFollowUpAction(formData);
        if (!result.ok) {
          setError(result.error);
          return;
        }
        router.refresh();
        if (result.url) {
          window.open(result.url, "_blank", "noopener,noreferrer");
        }
      }}
    >
      <input type="hidden" name="id" value={leadId} />
      <button type="submit" className="admin-ghost">
        WhatsApp customer
      </button>
      {error ? (
        <p className="mt-2 text-[0.72rem] text-accent" role="alert">
          {error}
        </p>
      ) : null}
    </form>
  );
}
