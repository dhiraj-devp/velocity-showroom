import type { VehicleRecord } from "@/features/vehicles/types";
import { CompareToggle } from "@/features/compare/components/CompareToggle";
import { VehicleCard } from "@/features/vehicles/components/VehicleCard";

export function VehicleGrid({ records }: { records: VehicleRecord[] }) {
  return (
    <ul className="grid gap-px bg-border sm:grid-cols-2 xl:grid-cols-3">
      {records.map((record) => (
        <li key={record.vehicle.id} className="bg-background">
          <VehicleCard record={record} />
          <div className="border-x border-b border-border px-5 py-3">
            <CompareToggle slug={record.vehicle.slug} />
          </div>
        </li>
      ))}
    </ul>
  );
}
