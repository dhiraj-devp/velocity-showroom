import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type SectionHeadingProps = {
  eyebrow?: string;
  title: ReactNode;
  description?: string;
  align?: "left" | "center";
  className?: string;
};

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "max-w-3xl",
        align === "center" && "mx-auto text-center",
        className,
      )}
    >
      {eyebrow ? (
        <p className="mb-5 font-sans text-[0.7rem] font-medium tracking-[0.42em] text-accent uppercase">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="font-display text-4xl leading-[0.95] font-semibold tracking-[-0.03em] text-balance sm:text-5xl lg:text-6xl">
        {title}
      </h2>
      {description ? (
        <p
          className={cn(
            "mt-6 max-w-xl text-base leading-relaxed text-muted sm:text-lg",
            align === "center" && "mx-auto",
          )}
        >
          {description}
        </p>
      ) : null}
    </div>
  );
}
