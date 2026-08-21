import type { VehicleAvailability } from "@/features/vehicles/types";

export function availabilityLabel(status: VehicleAvailability): string {
  switch (status) {
    case "reserved":
      return "Reserved";
    case "sold":
      return "Sold";
    case "coming_soon":
      return "Arriving";
    default:
      return "Available";
  }
}

export function availabilityNote(status: VehicleAvailability): string | null {
  switch (status) {
    case "reserved":
      return "This machine is currently held for a client. You may still enquire.";
    case "sold":
      return "This machine has been placed. We can introduce similar vehicles from the house.";
    case "coming_soon":
      return "Arriving shortly. Register your interest and the desk will follow.";
    default:
      return null;
  }
}

export function canBookViewing(status: VehicleAvailability): boolean {
  return status === "available";
}

export function canEnquireAboutVehicle(status: VehicleAvailability): boolean {
  return status === "available" || status === "reserved";
}

export function canRegisterInterest(status: VehicleAvailability): boolean {
  return status === "coming_soon";
}

export function isFeaturedEligible(status: VehicleAvailability): boolean {
  return status === "available";
}
