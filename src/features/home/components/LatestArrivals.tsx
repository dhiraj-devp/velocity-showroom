import { MagneticButton } from "@/components/common/MagneticButton";
import { SectionHeading } from "@/components/common/SectionHeading";
import { MotionReveal } from "@/features/home/motion/MotionReveal";
import { VehicleCard } from "@/features/vehicles/components/VehicleCard";
import type { VehicleRecord } from "@/features/vehicles/types";

type LatestArrivalsProps = {
  records: VehicleRecord[];
};

const VARIANTS = ["left", "up", "right", "scale", "tilt", "down"] as const;

export function LatestArrivals({ records }: LatestArrivalsProps) {
  if (records.length === 0) return null;

  return (
    <section
      id="latest"
      aria-labelledby="latest-heading"
      className="overflow-x-hidden border-t border-border px-5 py-20 md:px-10 md:py-28 lg:px-14"
    >
      <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
        <MotionReveal variant="up">
          <SectionHeading
            eyebrow="Inventory"
            title={<span id="latest-heading">Latest arrivals.</span>}
            description="Newly added machines, ordered by the date they entered the catalogue."
          />
        </MotionReveal>
        <MotionReveal variant="right" delay={80}>
          <MagneticButton href="/cars" variant="secondary">
            View all
          </MagneticButton>
        </MotionReveal>
      </div>

      <ul className="mt-14 grid gap-px overflow-hidden bg-border sm:grid-cols-2 xl:grid-cols-3">
        {records.map((record, index) => (
          <MotionReveal
            key={record.vehicle.id}
            as="li"
            variant={VARIANTS[index % VARIANTS.length]}
            delay={Math.min(index, 5) * 70}
            className="overflow-hidden bg-background"
          >
            <VehicleCard record={record} alwaysShowAvailability />
          </MotionReveal>
        ))}
      </ul>
    </section>
  );
}
