import type { Dealership } from "@/features/dealership/types";
import { availabilityLabel } from "@/features/vehicles/lib/availability";
import type { VehicleRecord } from "@/features/vehicles/types";
import { absoluteUrl } from "@/lib/siteUrl";

function offerAvailability(status: VehicleRecord["vehicle"]["availability"]) {
  if (status === "sold") return "https://schema.org/OutOfStock";
  if (status === "coming_soon") return "https://schema.org/PreOrder";
  if (status === "reserved") return "https://schema.org/LimitedAvailability";
  return "https://schema.org/InStock";
}

export function vehicleJsonLd(record: VehicleRecord, dealership: Dealership) {
  const url = absoluteUrl(`/cars/${record.vehicle.slug}`);
  const hero = record.vehicle.images[0]?.src;
  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Vehicle",
    name: `${record.brand.name} ${record.vehicle.name}`,
    brand: { "@type": "Brand", name: record.brand.name },
    model: record.model.name,
    vehicleModelDate: String(record.vehicle.year),
    url,
    offers: {
      "@type": "Offer",
      url,
      priceCurrency: record.vehicle.currency,
      price: String(record.vehicle.price),
      availability: offerAvailability(record.vehicle.availability),
      itemCondition:
        record.vehicle.condition === "new"
          ? "https://schema.org/NewCondition"
          : "https://schema.org/UsedCondition",
      seller: { "@type": "AutoDealer", name: dealership.name },
    },
  };
  if (hero) data.image = hero.startsWith("http") ? hero : absoluteUrl(hero);
  if (record.vehicle.mileageKm !== undefined) {
    data.mileageFromOdometer = {
      "@type": "QuantitativeValue",
      value: record.vehicle.mileageKm,
      unitCode: "KMT",
    };
  }
  if (record.vehicle.fuelType) {
    data.fuelType = record.vehicle.fuelType;
  }
  if (record.vehicle.transmission) {
    data.vehicleTransmission = record.vehicle.transmission;
  }
  if (record.vehicle.description) {
    data.description = record.vehicle.description;
  }
  data.additionalProperty = {
    "@type": "PropertyValue",
    name: "Availability",
    value: availabilityLabel(record.vehicle.availability),
  };
  return data;
}
