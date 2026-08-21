import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { VehicleDetail } from "@/features/vehicles/components/VehicleDetail";
import { localVehicleRepository } from "@/features/vehicles/repository/localVehicleRepository";

type VehiclePageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return localVehicleRepository.getCatalog().vehicles.map((vehicle) => ({
    slug: vehicle.slug,
  }));
}

export async function generateMetadata({
  params,
}: VehiclePageProps): Promise<Metadata> {
  const { slug } = await params;
  const record = localVehicleRepository.getVehicleBySlug(slug);
  if (!record) {
    return { title: "Vehicle | VELOCITY" };
  }

  return {
    title: `${record.brand.name} ${record.vehicle.name} | VELOCITY`,
    description: record.vehicle.description,
  };
}

export default async function VehiclePage({ params }: VehiclePageProps) {
  const { slug } = await params;
  const record = localVehicleRepository.getVehicleBySlug(slug);
  if (!record) notFound();
  const similar = localVehicleRepository.getSimilarVehicles(record);

  return (
    <main id="main" tabIndex={-1} className="outline-none">
      <VehicleDetail record={record} similar={similar} />
    </main>
  );
}
