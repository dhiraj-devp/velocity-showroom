import type { PricePreset } from "@/features/vehicles/types";

export const PRICE_PRESETS: PricePreset[] = [
  { id: "any", label: "Any Price", min: null, max: null },
  { id: "under-10l", label: "Under ₹10L", min: null, max: 1_000_000 },
  { id: "10-25l", label: "₹10L–₹25L", min: 1_000_000, max: 2_500_000 },
  { id: "25-50l", label: "₹25L–₹50L", min: 2_500_000, max: 5_000_000 },
  { id: "50l-1cr", label: "₹50L–₹1Cr", min: 5_000_000, max: 10_000_000 },
  { id: "1cr-plus", label: "₹1Cr+", min: 10_000_000, max: null },
];

export function matchPricePreset(min: number | null, max: number | null) {
  return (
    PRICE_PRESETS.find((preset) => preset.min === min && preset.max === max) ?? null
  );
}
