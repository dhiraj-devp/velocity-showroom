import type { Metadata } from "next";
import Link from "next/link";
import { CompareFromStorage } from "@/features/compare/components/CompareFromStorage";
import { PersistCompareSlugs } from "@/features/compare/components/PersistCompareSlugs";
import { CompareTable } from "@/features/compare/components/CompareTable";
import { parseCompareSearchParams } from "@/features/compare/lib/state";
import { dealershipRepository } from "@/features/dealership/repository/dealershipRepository";
import { vehicleRepository } from "@/features/vehicles/repository/vehicleRepository";

export const metadata: Metadata = {
  title: "Compare | VELOCITY",
  description: "Compare motor cars from the private collection.",
  robots: { index: false, follow: true },
};

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ComparePage({ searchParams }: PageProps) {
  const params = await searchParams;
  const slugs = parseCompareSearchParams(params);
  const [catalog, dealership] = await Promise.all([
    vehicleRepository.getCatalog(),
    dealershipRepository.get(),
  ]);
  const records = slugs
    .map((slug) => catalog.vehicles.find((vehicle) => vehicle.slug === slug))
    .filter((vehicle): vehicle is NonNullable<typeof vehicle> => Boolean(vehicle))
    .map((vehicle) => {
      const brand = catalog.brands.find((item) => item.id === vehicle.brandId);
      const model = catalog.models.find((item) => item.id === vehicle.modelId);
      const category = catalog.categories.find((item) => item.id === vehicle.categoryId);
      if (!brand || !model || !category) return null;
      return { vehicle, brand, model, category };
    })
    .filter((record): record is NonNullable<typeof record> => record !== null);

  return (
    <main id="main" tabIndex={-1} className="outline-none px-5 pt-28 pb-24 md:px-10 md:pt-32 lg:px-14">
      <CompareFromStorage hasUrlSlugs={slugs.length > 0} />
      <PersistCompareSlugs slugs={slugs} />
      <p className="text-[0.7rem] tracking-[0.42em] text-accent uppercase">Collection</p>
      <h1 className="font-display mt-5 text-[clamp(2.4rem,7vw,5rem)] leading-[0.9] tracking-[-0.045em]">
        Compare.
      </h1>
      <p className="mt-6 max-w-xl text-base text-muted">
        Three cars at most. Figures side by side. Nothing invented.
      </p>
      <Link href="/cars" className="mt-6 inline-block text-[0.62rem] tracking-[0.24em] uppercase">
        ← Collection
      </Link>
      <CompareTable records={records} dealership={dealership} />
    </main>
  );
}
