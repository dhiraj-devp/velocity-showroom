import { ActionForm } from "@/features/admin/components/ActionForm";
import {
  clearLeadFollowUpAction,
  markLeadContactedAction,
  updateLeadFollowUpAction,
  updateLeadSourceAction,
} from "@/features/admin/actions/leads";
import {
  followUpStateLabel,
  formatDeskDateTime,
  getFollowUpState,
  overdueDurationLabel,
  toDateInputValue,
  toTimeInputValue,
} from "@/features/leads/lib/followUp";
import { LEAD_SOURCE_LABELS } from "@/features/leads/lib/source";
import { LEAD_SOURCES, type Lead } from "@/features/leads/types";

export function LeadFollowUpSection({ lead }: { lead: Lead }) {
  const state = getFollowUpState(lead.nextFollowUpAt);
  const stateLabel =
    state === "overdue" && lead.nextFollowUpAt
      ? overdueDurationLabel(lead.nextFollowUpAt)
      : followUpStateLabel(state);

  return (
    <section className="mt-12">
      <h2 className="admin-heading">Follow-up</h2>
      <p className="mt-3 text-sm">
        <span className="follow-up-state" data-state={state}>
          {stateLabel}
        </span>
      </p>
      <dl className="mt-4 grid gap-4 sm:grid-cols-2 text-sm">
        <div>
          <dt className="text-[0.58rem] tracking-[0.2em] text-muted uppercase">Next follow-up</dt>
          <dd className="mt-1">{formatDeskDateTime(lead.nextFollowUpAt)}</dd>
        </div>
        <div>
          <dt className="text-[0.58rem] tracking-[0.2em] text-muted uppercase">Last contacted</dt>
          <dd className="mt-1">{formatDeskDateTime(lead.lastContactedAt)}</dd>
        </div>
      </dl>

      <ActionForm
        action={updateLeadFollowUpAction}
        className="mt-6 grid gap-3 sm:grid-cols-3"
        success="Follow-up scheduled."
      >
        <input type="hidden" name="id" value={lead.id} />
        <label className="collection-field">
          <span className="collection-label">Date</span>
          <input
            className="collection-input"
            type="date"
            name="date"
            defaultValue={toDateInputValue(lead.nextFollowUpAt)}
            required
          />
        </label>
        <label className="collection-field">
          <span className="collection-label">Time</span>
          <input
            className="collection-input"
            type="time"
            name="time"
            defaultValue={toTimeInputValue(lead.nextFollowUpAt) || "10:00"}
            required
          />
        </label>
        <div className="flex items-end">
          <button type="submit" className="collection-apply w-full">
            {lead.nextFollowUpAt ? "Reschedule" : "Set follow-up"}
          </button>
        </div>
      </ActionForm>

      {lead.nextFollowUpAt ? (
        <ActionForm action={clearLeadFollowUpAction} className="mt-3" success="Follow-up cleared.">
          <input type="hidden" name="id" value={lead.id} />
          <button type="submit" className="admin-ghost">
            Clear follow-up
          </button>
        </ActionForm>
      ) : null}

      <ActionForm action={markLeadContactedAction} className="mt-8" success="Contact recorded.">
        <input type="hidden" name="id" value={lead.id} />
        <label className="collection-field">
          <span className="collection-label">Note after contact (optional)</span>
          <textarea className="collection-input min-h-24 py-3" name="body" />
        </label>
        <button type="submit" className="collection-apply mt-3">
          Mark contact completed
        </button>
      </ActionForm>

      <ActionForm
        action={updateLeadSourceAction}
        className="mt-8 grid gap-3 sm:grid-cols-3"
        success="Source updated."
      >
        <input type="hidden" name="id" value={lead.id} />
        <label className="collection-field">
          <span className="collection-label">Source</span>
          <select className="collection-select" name="source" defaultValue={lead.source}>
            {LEAD_SOURCES.map((source) => (
              <option key={source} value={source}>
                {LEAD_SOURCE_LABELS[source]}
              </option>
            ))}
          </select>
        </label>
        <label className="collection-field">
          <span className="collection-label">Source detail</span>
          <input
            className="collection-input"
            name="sourceDetail"
            defaultValue={lead.sourceDetail ?? ""}
            maxLength={64}
          />
        </label>
        <div className="flex items-end">
          <button type="submit" className="collection-apply w-full">
            Update source
          </button>
        </div>
      </ActionForm>
    </section>
  );
}
