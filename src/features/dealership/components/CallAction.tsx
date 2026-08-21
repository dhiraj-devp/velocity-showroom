"use client";

import { toTelHref } from "@/features/dealership/lib/contact";
import type { Dealership } from "@/features/dealership/types";
import { trackProductEvent } from "@/features/analytics/lib/track";
import { trackPublicInteraction } from "@/features/leads/lib/trackClient";
import { cn } from "@/lib/cn";

type CallActionProps = {
  dealership: Dealership;
  vehicleId?: string;
  children?: string;
  className?: string;
};

export function CallAction({
  dealership,
  vehicleId,
  children = "Call dealer",
  className,
}: CallActionProps) {
  return (
    <a
      href={toTelHref(dealership.phone)}
      onClick={() => {
        if (vehicleId) {
          trackPublicInteraction("call", vehicleId);
          trackProductEvent("call_click", { vehicleId });
        }
      }}
      className={cn(
        "text-[0.62rem] tracking-[0.22em] text-muted uppercase transition-colors hover:text-foreground",
        className,
      )}
    >
      {children}
    </a>
  );
}
