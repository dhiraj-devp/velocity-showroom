import Link from "next/link";
import { MagneticButton } from "@/components/common/MagneticButton";
import { VehicleImageFrame } from "@/features/vehicles/components/VehicleImageFrame";
import { formatPrice } from "@/features/vehicles/lib/formatCurrency";
import { getHeroImage } from "@/features/vehicles/lib/resolveVehicle";
import type { VehicleRecord } from "@/features/vehicles/types";

type SpinPromoProps = {
  record: VehicleRecord | null;
};

export function SpinPromo({ record }: SpinPromoProps) {
  if (!record) return null;

  const { vehicle, brand } = record;
  const hero = getHeroImage(record);

  return (
    <section
      id="spin"
      aria-labelledby="spin-heading"
      className="home-reveal border-t border-border px-5 py-20 md:px-10 md:py-28 lg:px-14"
    >
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-center lg:gap-16">
        <Link
          href={`/cars/${vehicle.slug}#view-360`}
          className="block overflow-hidden border border-border"
          aria-label={`Open 360 view of ${brand.name} ${vehicle.name}`}
        >
          <VehicleImageFrame
            image={hero}
            brandId={brand.id}
            brandName={brand.name}
            vehicleName={vehicle.name}
            className="aspect-[16/10]"
          />
        </Link>

        <div>
          <p className="text-[0.7rem] tracking-[0.42em] text-accent uppercase">
            360° photography
          </p>
          <h2
            id="spin-heading"
            className="font-display mt-5 text-4xl tracking-[-0.03em] sm:text-5xl lg:text-6xl"
          >
            Walk around the machine.
          </h2>
          <p className="mt-6 max-w-md text-base leading-relaxed text-muted">
            Real photography, not a generated model. Drag through every angle of
            the {brand.name} {vehicle.name}.
          </p>
          <p className="mt-4 text-sm text-muted">
            {formatPrice(vehicle.price, vehicle.currency)} · {vehicle.year}
          </p>
          <div className="mt-10">
            <MagneticButton href={`/cars/${vehicle.slug}#view-360`}>
              Open 360° view
            </MagneticButton>
          </div>
        </div>
      </div>
    </section>
  );
}
