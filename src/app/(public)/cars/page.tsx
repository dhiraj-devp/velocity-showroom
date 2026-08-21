import type { Metadata } from "next";
import { VehicleCollection } from "@/features/vehicles/components/VehicleCollection";
import { parseCollectionQuery } from "@/features/vehicles/lib/filterQuery";
import { vehicleRepository } from "@/features/vehicles/repository/vehicleRepository";

export const metadata: Metadata = {
  title: "Collection | VELOCITY",
  description: "Browse the VELOCITY private collection of motor cars.",
};

type CarsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function CarsPage({ searchParams }: CarsPageProps) {
  const catalog = await vehicleRepository.getCatalog();
  const params = await searchParams;
  const { filters, sort } = parseCollectionQuery(params, catalog);

  return (
    <main id="main" tabIndex={-1} className="outline-none">
      <section className="px-5 pt-28 pb-10 md:px-10 md:pt-32 lg:px-14">
        <p className="text-[0.7rem] tracking-[0.42em] text-accent uppercase">
          Collection
        </p>
        <h1 className="font-display mt-5 max-w-[12ch] text-[clamp(2.8rem,8vw,6.5rem)] leading-[0.88] font-semibold tracking-[-0.045em]">
          The private list.
        </h1>
        <p className="mt-6 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
          A considered selection of motor cars. Presence first. Figures where they
          belong.
        </p>
      </section>

      <section className="px-5 pb-24 md:px-10 md:pb-32 lg:px-14">
        <VehicleCollection
          catalog={catalog}
          initialFilters={filters}
          initialSort={sort}
        />
      </section>
    </main>
  );
}
