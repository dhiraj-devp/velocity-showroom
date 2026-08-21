"use client";

import { useEffect } from "react";
import { trackProductEvent } from "@/features/analytics/lib/track";

export function VehicleViewTracker({ vehicleId, slug }: { vehicleId: string; slug: string }) {
  useEffect(() => {
    trackProductEvent("vehicle_view", { vehicleId, slug });
  }, [slug, vehicleId]);
  return null;
}
