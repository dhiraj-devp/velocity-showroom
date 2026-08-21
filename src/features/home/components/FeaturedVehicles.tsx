import { MagneticButton } from "@/components/common/MagneticButton";
import { SectionHeading } from "@/components/common/SectionHeading";
import { formatPrice } from "@/features/vehicles/lib/formatCurrency";
import { localVehicleRepository } from "@/features/vehicles/repository/localVehicleRepository";
import type { VehicleRecord } from "@/features/vehicles/types";

export function FeaturedVehicles() {
  const featured = localVehicleRepository.getFeaturedVehicles();

  return (
    <section
      id="vehicles"
      aria-labelledby="vehicles-heading"
      className="border-b border-border px-5 pt-10 pb-24 md:px-10 md:pt-12 md:pb-32 lg:px-14 lg:pt-14 lg:pb-40"
    >
      <SectionHeading
        eyebrow="The Collection"
        title={<span id="vehicles-heading">Featured machines.</span>}
        description="Signatures from the house. Presence first. Figures second."
      />

      <ul className="mt-16 grid gap-px bg-border lg:mt-20 lg:grid-cols-3">
        {featured.map((record, index) => (
          <li key={record.vehicle.id} className="bg-background">
            <FeaturedPanel record={record} index={index + 1} />
          </li>
        ))}
      </ul>
    </section>
  );
}

function FeaturedPanel({
  record,
  index,
}: {
  record: VehicleRecord;
  index: number;
}) {
  const order = String(index).padStart(2, "0");
  const { vehicle, brand } = record;

  return (
    <article className="vehicle-panel flex h-full flex-col p-7 sm:p-9">
      <div className="relative mb-10 flex min-h-40 items-end justify-center overflow-hidden bg-surface">
        <div
          aria-hidden="true"
          className="vehicle-glow pointer-events-none absolute inset-x-8 bottom-4 h-16 rounded-[100%] bg-accent/25 opacity-40 blur-2xl transition-opacity duration-300"
        />
        <p className="relative mb-6 px-6 text-center font-display text-3xl tracking-[-0.03em] text-foreground/80">
          {brand.name}
        </p>
      </div>

      <p className="text-[0.65rem] tracking-[0.28em] text-accent uppercase">
        {order}
      </p>
      <h3 className="font-display mt-3 text-3xl tracking-[-0.03em] sm:text-4xl">
        {vehicle.name}
      </h3>
      <p className="mt-2 text-sm text-muted">
        {formatPrice(vehicle.price, vehicle.currency)}
      </p>

      <dl className="mt-8 grid grid-cols-2 gap-6 border-t border-border pt-6">
        <div>
          <dt className="text-[0.62rem] tracking-[0.22em] text-muted uppercase">
            Year
          </dt>
          <dd className="mt-2 text-lg text-foreground">{vehicle.year}</dd>
        </div>
        <div>
          <dt className="text-[0.62rem] tracking-[0.22em] text-muted uppercase">
            Origin
          </dt>
          <dd className="mt-2 text-lg text-foreground">{brand.name}</dd>
        </div>
      </dl>

      <div className="mt-10">
        <MagneticButton href={`/cars/${vehicle.slug}`} variant="secondary">
          View vehicle
        </MagneticButton>
      </div>
    </article>
  );
}
