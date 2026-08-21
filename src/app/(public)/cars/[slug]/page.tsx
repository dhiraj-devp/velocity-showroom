import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { VehicleDetail } from "@/features/vehicles/components/VehicleDetail";
import { vehicleRepository } from "@/features/vehicles/repository/vehicleRepository";
import { dealershipRepository } from "@/features/dealership/repository/dealershipRepository";
import { getHeroImage } from "@/features/vehicles/lib/resolveVehicle";
import { formatPrice } from "@/features/vehicles/lib/formatCurrency";
import { absoluteUrl } from "@/lib/siteUrl";

type VehiclePageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const catalog = await vehicleRepository.getCatalog();
  return catalog.vehicles.map((vehicle) => ({
    slug: vehicle.slug,
  }));
}

export async function generateMetadata({
  params,
}: VehiclePageProps): Promise<Metadata> {
  const { slug } = await params;
  const [record, dealership] = await Promise.all([
    vehicleRepository.getVehicleBySlug(slug),
    dealershipRepository.get(),
  ]);
  if (!record) {
    return { title: `Vehicle | ${dealership.name}` };
  }

  const title = `${record.brand.name} ${record.vehicle.name} | ${dealership.name}`;
  const description =
    record.vehicle.description.trim() ||
    `${record.brand.name} ${record.vehicle.name}, ${record.vehicle.year}. ${formatPrice(record.vehicle.price, record.vehicle.currency)}.`;
  const url = absoluteUrl(`/cars/${record.vehicle.slug}`);
  const hero = getHeroImage(record);
  const image = hero?.src
    ? hero.src.startsWith("http")
      ? hero.src
      : absoluteUrl(hero.src)
    : undefined;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: "website",
      siteName: dealership.name,
      ...(image ? { images: [{ url: image }] } : {}),
    },
  };
}

export default async function VehiclePage({ params }: VehiclePageProps) {
  const { slug } = await params;
  const record = await vehicleRepository.getVehicleBySlug(slug);
  if (!record) notFound();
  const similar = await vehicleRepository.getSimilarVehicles(record);
  const dealership = await dealershipRepository.get();

  return (
    <main id="main" tabIndex={-1} className="outline-none">
      <VehicleDetail record={record} similar={similar} dealership={dealership} />
    </main>
  );
}
