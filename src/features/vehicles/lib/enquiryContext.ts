import type { Dealership } from "@/features/dealership/types";
import type { VehicleRecord } from "@/features/vehicles/types";

export function formatVehicleTitle(record: VehicleRecord): string {
  return `${record.brand.name} ${record.vehicle.name}`;
}

export function buildVehicleEnquiryMessage(
  record: VehicleRecord,
  dealership: Dealership,
): string {
  const title = formatVehicleTitle(record);
  return `Hello, I am interested in the ${title} (${record.vehicle.year}). I would like to know more about this vehicle. — ${dealership.name}`;
}

export function buildSimilarEnquiryMessage(
  record: VehicleRecord,
  dealership: Dealership,
): string {
  const title = formatVehicleTitle(record);
  return `Hello, I am looking for vehicles similar to the ${title} (${record.vehicle.year}). Please share suitable options. — ${dealership.name}`;
}

export function buildInterestMessage(
  record: VehicleRecord,
  dealership: Dealership,
): string {
  const title = formatVehicleTitle(record);
  return `Hello, please register my interest in the ${title} (${record.vehicle.year}) when it arrives. — ${dealership.name}`;
}

export type EnquiryContext = {
  vehicleId: string;
  vehicleName: string;
  vehicleSlug: string;
  pagePath: string;
};

export function buildEnquiryContext(record: VehicleRecord): EnquiryContext {
  return {
    vehicleId: record.vehicle.id,
    vehicleName: formatVehicleTitle(record),
    vehicleSlug: record.vehicle.slug,
    pagePath: `/cars/${record.vehicle.slug}`,
  };
}
