import { toTelHref } from "@/features/dealership/lib/contact";
import type { Dealership } from "@/features/dealership/types";
import { cn } from "@/lib/cn";

type CallActionProps = {
  dealership: Dealership;
  children?: string;
  className?: string;
};

export function CallAction({
  dealership,
  children = "Call dealer",
  className,
}: CallActionProps) {
  return (
    <a
      href={toTelHref(dealership.phone)}
      className={cn(
        "text-[0.62rem] tracking-[0.22em] text-muted uppercase transition-colors hover:text-foreground",
        className,
      )}
    >
      {children}
    </a>
  );
}
