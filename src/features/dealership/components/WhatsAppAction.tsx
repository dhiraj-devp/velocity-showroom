"use client";

import { buildWhatsAppUrl } from "@/features/dealership/lib/contact";
import type { Dealership } from "@/features/dealership/types";
import { trackProductEvent } from "@/features/analytics/lib/track";
import { trackPublicInteraction } from "@/features/leads/lib/trackClient";
import { cn } from "@/lib/cn";

type WhatsAppActionProps = {
  dealership: Dealership;
  message: string;
  vehicleId?: string;
  children?: string;
  className?: string;
  variant?: "link" | "button";
};

export function WhatsAppAction({
  dealership,
  message,
  vehicleId,
  children = "WhatsApp dealer",
  className,
  variant = "link",
}: WhatsAppActionProps) {
  const href = buildWhatsAppUrl(dealership.whatsapp, message);

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => {
        if (vehicleId) {
          trackPublicInteraction("whatsapp", vehicleId);
          trackProductEvent("whatsapp_click", { vehicleId });
        }
      }}
      className={cn(
        variant === "button"
          ? "inline-flex min-h-12 flex-1 items-center justify-center border border-border px-4 text-[0.62rem] tracking-[0.22em] uppercase"
          : "text-[0.62rem] tracking-[0.22em] text-muted uppercase transition-colors hover:text-foreground",
        className,
      )}
    >
      {children}
    </a>
  );
}
