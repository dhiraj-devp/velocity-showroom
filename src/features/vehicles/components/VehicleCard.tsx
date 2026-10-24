import Link from "next/link";
import { VehicleImageFrame } from "@/features/vehicles/components/VehicleImageFrame";
import { VehicleStatus } from "@/features/vehicles/components/VehicleStatus";
import {
  formatFuel,
  formatPrice,
  formatTransmission,
} from "@/features/vehicles/lib/formatCurrency";
import { getHeroImage } from "@/features/vehicles/lib/resolveVehicle";
import type { VehicleRecord } from "@/features/vehicles/types";

export function VehicleCard({
  record,
  alwaysShowAvailability = false,
}: {
  record: VehicleRecord;
  alwaysShowAvailability?: boolean;
}) {
  const { vehicle, brand } = record;
  const hero = getHeroImage(record);

  return (
    <article className="vehicle-card group flex h-full flex-col">
      <Link href={`/cars/${vehicle.slug}`} className="flex h-full flex-col">
        <VehicleImageFrame
          image={hero}
          brandId={brand.id}
          brandName={brand.name}
          vehicleName={vehicle.name}
          className="aspect-[16/10]"
          showCaption={false}
        />

        <div className="flex flex-1 flex-col border-x border-b border-border px-5 py-6">
          <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
            <p className="text-[0.58rem] tracking-[0.32em] text-accent uppercase">
              {brand.name}
            </p>
            <VehicleStatus
              status={vehicle.availability}
              alwaysShow={alwaysShowAvailability}
            />
          </div>
          <h3 className="font-display mt-3 text-2xl tracking-[-0.03em]">
            {vehicle.name}
          </h3>
          <p className="mt-3 text-[0.72rem] tracking-[0.16em] text-muted uppercase">
            {vehicle.year} · {formatTransmission(vehicle.transmission)} · {formatFuel(vehicle.fuelType)}
          </p>
          <p className="mt-6 font-display text-xl tracking-[-0.02em]">
            {formatPrice(vehicle.price, vehicle.currency)}
          </p>
          <p className="mt-auto pt-6 text-[0.62rem] tracking-[0.28em] text-accent uppercase">
            View vehicle →
          </p>
        </div>
      </Link>
    </article>
  );
}
