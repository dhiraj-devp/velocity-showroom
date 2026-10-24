"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/cn";

export type MotionVariant = "left" | "right" | "up" | "down" | "scale" | "tilt";

type MotionRevealProps = {
  children: ReactNode;
  variant?: MotionVariant;
  delay?: number;
  className?: string;
  as?: "div" | "li" | "article" | "section";
};

export function MotionReveal({
  children,
  variant = "up",
  delay = 0,
  className,
  as: Tag = "div",
}: MotionRevealProps) {
  const node = useRef<HTMLElement>(null);

  useEffect(() => {
    const target = node.current;
    if (!target) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      target.dataset.inview = "true";
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        target.dataset.inview = "true";
        observer.disconnect();
      },
      { threshold: 0.14, rootMargin: "0px 0px -10% 0px" },
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={node as never}
      data-motion={variant}
      data-inview="false"
      className={cn("motion-reveal", className)}
      style={{ transitionDelay: delay ? `${delay}ms` : undefined }}
    >
      {children}
    </Tag>
  );
}
