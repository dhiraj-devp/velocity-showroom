import { MagneticButton } from "@/components/common/MagneticButton";
import { SectionHeading } from "@/components/common/SectionHeading";
import { VehicleCard } from "@/features/vehicles/components/VehicleCard";
import type { VehicleRecord } from "@/features/vehicles/types";

type LatestArrivalsProps = {
  records: VehicleRecord[];
};

export function LatestArrivals({ records }: LatestArrivalsProps) {
  if (records.length === 0) return null;

  return (
    <section
      id="latest"
      aria-labelledby="latest-heading"
      className="home-reveal border-t border-border px-5 py-20 md:px-10 md:py-28 lg:px-14"
    >
      <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
        <SectionHeading
          eyebrow="Inventory"
          title={<span id="latest-heading">Latest arrivals.</span>}
          description="Newly added machines, ordered by the date they entered the catalogue."
        />
        <MagneticButton href="/cars" variant="secondary">
          View all
        </MagneticButton>
      </div>

      <ul className="mt-14 grid gap-px bg-border sm:grid-cols-2 xl:grid-cols-3">
        {records.map((record) => (
          <li key={record.vehicle.id} className="bg-background">
            <VehicleCard record={record} alwaysShowAvailability />
          </li>
        ))}
      </ul>
    </section>
  );
}
