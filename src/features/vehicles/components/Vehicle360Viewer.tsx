"use client";

import { useEffect } from "react";
import { useVehicle360 } from "@/features/vehicles/hooks/useVehicle360";
import type { Vehicle360Frame } from "@/features/vehicles/types";
import { cn } from "@/lib/cn";

export function Vehicle360Viewer({
  name,
  frames,
  className,
  compact = false,
  captureKeys = false,
}: {
  name: string;
  frames: Vehicle360Frame[];
  className?: string;
  compact?: boolean;
  captureKeys?: boolean;
}) {
  const { bind, current, index, loaded, markLoaded, ordered, step } = useVehicle360(frames);

  useEffect(() => {
    if (!captureKeys) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "ArrowRight") {
        event.preventDefault();
        step(1);
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        step(-1);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [captureKeys, step]);

  if (!current) {
    return (
      <div className={cn("vehicle-360-frame", className)}>
        <p className="px-5 py-10 text-center text-sm text-muted">No frames in this sequence.</p>
      </div>
    );
  }

  return (
    <div className={className}>
      <div
        className="vehicle-360-frame touch-none"
        {...bind}
        role="img"
        aria-label={`${name} 360 view. Drag or swipe to rotate. Frame ${index + 1} of ${ordered.length}.`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={current.id}
          src={current.src}
          alt=""
          draggable={false}
          className="h-full w-full object-contain"
          onLoad={() => markLoaded(current.id)}
          onError={() => markLoaded(current.id)}
        />
        {!loaded ? (
          <p className="pointer-events-none absolute inset-x-0 bottom-10 text-center text-[0.58rem] tracking-[0.28em] text-muted uppercase">
            Loading frame
          </p>
        ) : null}
      </div>
      <p className="mt-3 text-center text-[0.58rem] tracking-[0.24em] text-muted uppercase">
        {compact ? null : "Drag to rotate · "}
        {index + 1} / {ordered.length}
      </p>
    </div>
  );
}
