import { availabilityLabel } from "@/features/vehicles/lib/availability";
import type { VehicleAvailability } from "@/features/vehicles/types";

export function VehicleStatus({
  status,
  alwaysShow = false,
}: {
  status: VehicleAvailability;
  alwaysShow?: boolean;
}) {
  if (!alwaysShow && status === "available") return null;

  return (
    <p className="text-[0.58rem] tracking-[0.32em] text-accent uppercase">
      {availabilityLabel(status)}
    </p>
  );
}
