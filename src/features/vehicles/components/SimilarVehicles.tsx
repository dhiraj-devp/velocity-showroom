import { VehicleGrid } from "@/features/vehicles/components/VehicleGrid";
import type { VehicleRecord } from "@/features/vehicles/types";

export function SimilarVehicles({ records }: { records: VehicleRecord[] }) {
  if (records.length === 0) return null;

  return (
    <section
      id="similar-vehicles"
      aria-labelledby="similar-heading"
      className="mt-20 border-t border-border pt-16 md:mt-28 md:pt-20"
    >
      <p className="text-[0.62rem] tracking-[0.36em] text-accent uppercase">
        Further from the house
      </p>
      <h2
        id="similar-heading"
        className="font-display mt-4 text-3xl tracking-[-0.03em] sm:text-4xl"
      >
        Similar machines
      </h2>
      <div className="mt-10">
        <VehicleGrid records={records} />
      </div>
    </section>
  );
}
