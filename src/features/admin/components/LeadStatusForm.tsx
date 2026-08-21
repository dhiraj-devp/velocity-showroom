"use client";

import { useState } from "react";
import { ActionForm } from "@/features/admin/components/ActionForm";
import { updateLeadStatusAction } from "@/features/admin/actions/leads";
import { LOST_REASON_LABELS } from "@/features/leads/lib/lostReason";
import { LEAD_STATUSES, LOST_REASONS, type Lead, type LeadStatus } from "@/features/leads/types";

export function LeadStatusForm({ lead }: { lead: Lead }) {
  const [status, setStatus] = useState<LeadStatus>(lead.status);
  const [lostReason, setLostReason] = useState(lead.lostReason ?? "");

  return (
    <ActionForm action={updateLeadStatusAction} className="mt-10 grid gap-3" success="Status updated.">
      <input type="hidden" name="id" value={lead.id} />
      <div className="flex flex-wrap items-end gap-3">
        <label className="collection-field">
          <span className="collection-label">Status</span>
          <select
            className="collection-select"
            name="status"
            value={status}
            onChange={(event) => setStatus(event.target.value as LeadStatus)}
          >
            {LEAD_STATUSES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
        <button type="submit" className="collection-apply">
          Update status
        </button>
      </div>
      {status === "lost" ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="collection-field">
            <span className="collection-label">Why was this lead lost?</span>
            <select
              className="collection-select"
              name="lostReason"
              value={lostReason}
              onChange={(event) => setLostReason(event.target.value)}
              required
            >
              <option value="">Select reason</option>
              {LOST_REASONS.map((reason) => (
                <option key={reason} value={reason}>
                  {LOST_REASON_LABELS[reason]}
                </option>
              ))}
            </select>
          </label>
          {lostReason === "other" ? (
            <label className="collection-field">
              <span className="collection-label">Other detail</span>
              <input
                className="collection-input"
                name="lostReasonDetail"
                maxLength={160}
                defaultValue={lead.lostReasonDetail ?? ""}
                placeholder="Optional"
              />
            </label>
          ) : null}
        </div>
      ) : null}
      {status === "won" ? (
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
      ) : null}
    </ActionForm>
  );
}
