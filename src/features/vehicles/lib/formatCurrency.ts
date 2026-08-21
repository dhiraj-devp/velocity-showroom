import type { CurrencyCode } from "@/features/vehicles/types";

function trimNumber(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(2).replace(/\.?0+$/, "");
}

export function formatPrice(amount: number, currency: CurrencyCode = "INR"): string {
  if (currency === "INR") {
    if (amount >= 10_000_000) {
      return `₹${trimNumber(amount / 10_000_000)} Cr`;
    }
    if (amount >= 100_000) {
      return `₹${trimNumber(amount / 100_000)} L`;
    }
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatMileage(mileageKm: number): string {
  return `${new Intl.NumberFormat("en-IN").format(mileageKm)} km`;
}

export function formatFuel(fuelType: string): string {
  return fuelType.charAt(0).toUpperCase() + fuelType.slice(1);
}

export function formatTransmission(transmission: string): string {
  return transmission.charAt(0).toUpperCase() + transmission.slice(1);
}

export function formatCondition(condition: string): string {
  return condition.charAt(0).toUpperCase() + condition.slice(1);
}
