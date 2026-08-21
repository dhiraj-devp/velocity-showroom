import { ActionForm } from "@/features/admin/components/ActionForm";
import { updateLeadDealValueAction } from "@/features/admin/actions/leads";
import { LOST_REASON_LABELS } from "@/features/leads/lib/lostReason";
import { formatPrice } from "@/features/vehicles/lib/formatCurrency";
import type { Lead } from "@/features/leads/types";

export function LeadDealSection({ lead }: { lead: Lead }) {
  const open = lead.status !== "won" && lead.status !== "lost";

  return (
    <section className="mt-12">
      <h2 className="admin-heading">Deal value</h2>
      <dl className="mt-4 grid gap-4 sm:grid-cols-2 text-sm">
        <div>
          <dt className="text-[0.58rem] tracking-[0.2em] text-muted uppercase">Expected deal value</dt>
          <dd className="mt-1">{lead.expectedDealValue ? formatPrice(lead.expectedDealValue) : "Not set"}</dd>
        </div>
        <div>
          <dt className="text-[0.58rem] tracking-[0.2em] text-muted uppercase">Final sale value</dt>
          <dd className="mt-1">{lead.finalSaleValue ? formatPrice(lead.finalSaleValue) : "Not recorded"}</dd>
        </div>
        {lead.status === "lost" && lead.lostReason ? (
          <div className="sm:col-span-2">
            <dt className="text-[0.58rem] tracking-[0.2em] text-muted uppercase">Lost reason</dt>
            <dd className="mt-1">
              {LOST_REASON_LABELS[lead.lostReason]}
              {lead.lostReasonDetail ? ` — ${lead.lostReasonDetail}` : ""}
            </dd>
          </div>
        ) : null}
        {lead.assignedTo ? (
          <div>
            <dt className="text-[0.58rem] tracking-[0.2em] text-muted uppercase">Assigned to</dt>
            <dd className="mt-1">{lead.assignedTo}</dd>
          </div>
        ) : null}
      </dl>

      <ActionForm action={updateLeadDealValueAction} className="mt-6 grid gap-3 sm:grid-cols-2" success="Deal value saved.">
        <input type="hidden" name="id" value={lead.id} />
        <label className="collection-field">
          <span className="collection-label">Expected deal value (INR)</span>
          <input
            className="collection-input"
            name="expectedDealValue"
            inputMode="numeric"
            defaultValue={lead.expectedDealValue ?? ""}
            placeholder={open ? "Optional" : "For comparison"}
          />
        </label>
        {lead.status === "won" ? (
          <label className="collection-field">
            <span className="collection-label">Final sale value (INR)</span>
            <input
              className="collection-input"
              name="finalSaleValue"
              inputMode="numeric"
              defaultValue={lead.finalSaleValue ?? ""}
              placeholder="Optional"
            />
          </label>
        ) : (
          <p className="self-end text-sm text-muted">Final sale value is recorded when the lead is won.</p>
        )}
        <button type="submit" className="collection-apply sm:col-span-2">
          Save deal value
        </button>
      </ActionForm>
    </section>
  );
}
