"use client";

import { useRef } from "react";
import type { PointerEvent, ReactNode } from "react";
import { cn } from "@/lib/cn";

type MagneticButtonProps = {
  href: string;
  children: ReactNode;
  variant?: "primary" | "secondary";
  className?: string;
};

function shouldSkipMagnet(): boolean {
  return window.matchMedia(
    "(pointer: coarse), (prefers-reduced-motion: reduce)",
  ).matches;
}

export function MagneticButton({
  href,
  children,
  variant = "primary",
  className,
}: MagneticButtonProps) {
  const ref = useRef<HTMLAnchorElement>(null);

  function handlePointerMove(event: PointerEvent<HTMLAnchorElement>) {
    const node = ref.current;
    if (!node || shouldSkipMagnet()) return;

    const rect = node.getBoundingClientRect();
    const offsetX = event.clientX - rect.left - rect.width / 2;
    const offsetY = event.clientY - rect.top - rect.height / 2;
    node.style.transform = `translate(${offsetX * 0.22}px, ${offsetY * 0.32}px)`;
  }

  function resetPosition() {
    const node = ref.current;
    if (!node) return;
    node.style.transform = "translate(0, 0)";
  }

  return (
    <a
      ref={ref}
      href={href}
      onPointerMove={handlePointerMove}
      onPointerLeave={resetPosition}
      onPointerCancel={resetPosition}
      className={cn(
        "inline-flex items-center justify-center px-7 py-3.5 text-[0.7rem] font-medium tracking-[0.28em] uppercase transition-[color,background-color,border-color,transform] duration-200 ease-out",
        variant === "primary" &&
          "border border-accent bg-accent text-background hover:bg-accent-strong hover:border-accent-strong",
        variant === "secondary" &&
          "border border-border bg-transparent text-foreground hover:border-accent hover:text-accent",
        className,
      )}
    >
      {children}
    </a>
  );
}
