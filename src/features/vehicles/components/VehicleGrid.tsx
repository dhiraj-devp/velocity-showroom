import type { VehicleRecord } from "@/features/vehicles/types";
import { VehicleCard } from "@/features/vehicles/components/VehicleCard";

export function VehicleGrid({ records }: { records: VehicleRecord[] }) {
  return (
    <ul className="grid gap-px bg-border sm:grid-cols-2 xl:grid-cols-3">
      {records.map((record) => (
        <li key={record.vehicle.id} className="bg-background">
          <VehicleCard record={record} />
        </li>
      ))}
    </ul>
  );
}
