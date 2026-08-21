import { ActionForm } from "@/features/admin/components/ActionForm";
import { updateVehicleInternalAction } from "@/features/admin/actions/vehicleInternal";
import { estimatedMargin, type VehicleInternal } from "@/features/vehicles/lib/internal";
import { formatPrice } from "@/features/vehicles/lib/formatCurrency";

export function VehicleInternalSection({
  vehicleId,
  salePrice,
  record,
}: {
  vehicleId: string;
  salePrice: number;
  record: VehicleInternal | null;
}) {
  const margin = estimatedMargin(salePrice, record?.purchasePrice);

  return (
    <section className="admin-section">
      <h2>Internal dealer information</h2>
      <p className="text-sm text-muted">Desk only. These values never appear on the public website.</p>
      {margin !== null ? (
        <p className="mt-4 text-sm">
          Estimated margin: {formatPrice(margin)}{" "}
          <span className="text-muted">
            (sale price minus purchase price; not actual profit after tax, refurbishment, or commission)
          </span>
        </p>
      ) : (
        <p className="mt-4 text-sm text-muted">Add a purchase price to estimate margin against the public price.</p>
      )}
      <ActionForm action={updateVehicleInternalAction} className="mt-6 grid gap-3 sm:grid-cols-2" success="Internal details saved.">
        <input type="hidden" name="vehicleId" value={vehicleId} />
        <label className="collection-field">
          <span className="collection-label">Registration number</span>
          <input className="collection-input" name="registrationNumber" defaultValue={record?.registrationNumber ?? ""} />
        </label>
        <label className="collection-field">
          <span className="collection-label">VIN / chassis</span>
          <input className="collection-input" name="vinOrChassisNumber" defaultValue={record?.vinOrChassisNumber ?? ""} />
        </label>
        <label className="collection-field">
          <span className="collection-label">Ownership count</span>
          <input className="collection-input" name="ownershipCount" inputMode="numeric" defaultValue={record?.ownershipCount ?? ""} />
        </label>
        <label className="collection-field">
          <span className="collection-label">Number of keys</span>
          <input className="collection-input" name="numberOfKeys" inputMode="numeric" defaultValue={record?.numberOfKeys ?? ""} />
        </label>
        <label className="collection-field">
          <span className="collection-label">Purchase price (INR)</span>
          <input className="collection-input" name="purchasePrice" inputMode="numeric" defaultValue={record?.purchasePrice ?? ""} />
        </label>
        <label className="collection-field">
          <span className="collection-label">Purchase source</span>
          <input className="collection-input" name="purchaseSource" defaultValue={record?.purchaseSource ?? ""} />
        </label>
        <label className="collection-field">
          <span className="collection-label">Insurance expiry</span>
          <input className="collection-input" type="date" name="insuranceExpiry" defaultValue={record?.insuranceExpiry ?? ""} />
        </label>
        <label className="mt-6 flex items-center gap-3 text-sm">
          <input type="checkbox" name="serviceHistoryAvailable" defaultChecked={record?.serviceHistoryAvailable} />
          Service history available
        </label>
        <label className="collection-field sm:col-span-2">
          <span className="collection-label">Internal notes</span>
          <textarea className="collection-input min-h-24 py-3" name="internalNotes" defaultValue={record?.internalNotes ?? ""} />
        </label>
        <button type="submit" className="collection-apply sm:col-span-2">
          Save internal details
        </button>
      </ActionForm>
    </section>
  );
}
