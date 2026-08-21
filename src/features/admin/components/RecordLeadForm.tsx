import { ActionForm } from "@/features/admin/components/ActionForm";
import { createLeadAction } from "@/features/admin/actions/leads";
import { LEAD_SOURCE_LABELS } from "@/features/leads/lib/source";
import { LEAD_SOURCES } from "@/features/leads/types";
import type { Vehicle } from "@/features/vehicles/types";

export function RecordLeadForm({ vehicles }: { vehicles: Vehicle[] }) {
  return (
    <details className="mt-8 border border-border p-4">
      <summary className="cursor-pointer text-[0.62rem] tracking-[0.28em] text-accent uppercase">
        Record lead
      </summary>
      <ActionForm action={createLeadAction} className="mt-5 grid gap-3 md:grid-cols-2" success="Lead recorded.">
        <label className="collection-field">
          <span className="collection-label">Name</span>
          <input className="collection-input" name="name" required />
        </label>
        <label className="collection-field">
          <span className="collection-label">Phone</span>
          <input className="collection-input" name="phone" required />
        </label>
        <label className="collection-field">
          <span className="collection-label">Email (optional)</span>
          <input className="collection-input" name="email" />
        </label>
        <label className="collection-field">
          <span className="collection-label">Vehicle (optional)</span>
          <select className="collection-select" name="vehicleId" defaultValue="">
            <option value="">No vehicle</option>
            {vehicles.map((vehicle) => (
              <option key={vehicle.id} value={vehicle.id}>
                {vehicle.name}
              </option>
            ))}
          </select>
        </label>
        <label className="collection-field">
          <span className="collection-label">Source</span>
          <select className="collection-select" name="source" defaultValue="phone">
            {LEAD_SOURCES.map((source) => (
              <option key={source} value={source}>
                {LEAD_SOURCE_LABELS[source]}
              </option>
            ))}
          </select>
        </label>
        <label className="collection-field">
          <span className="collection-label">Source detail (optional)</span>
          <input className="collection-input" name="sourceDetail" maxLength={64} />
        </label>
        <label className="collection-field md:col-span-2">
          <span className="collection-label">Message (optional)</span>
          <textarea className="collection-input min-h-20 py-3" name="message" />
        </label>
        <button type="submit" className="collection-apply">
          Save lead
        </button>
      </ActionForm>
    </details>
  );
}
