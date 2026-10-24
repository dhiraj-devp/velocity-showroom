"use client";

import { useEffect, useRef, useState } from "react";
import { ShowroomCanvas } from "@/features/showroom/components/ShowroomCanvas";
import { ShowroomHud } from "@/features/showroom/components/ShowroomHud";
import { ShowroomViewport } from "@/features/showroom/components/ShowroomViewport";
import { VehicleExploration } from "@/features/showroom/components/VehicleExploration";

/**
 * Integration boundary for the showroom visual.
 * Homepage sections should keep depending on this component, not on Three.js internals.
 */
export function ShowroomStage() {
  const sentinel = useRef<HTMLDivElement>(null);
  const [mount, setMount] = useState(false);

  useEffect(() => {
    const target = sentinel.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        setMount(true);
        observer.disconnect();
      },
      { rootMargin: "280px 0px" },
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={sentinel}>
      <ShowroomViewport>
        {mount ? <ShowroomCanvas /> : <ShowroomPlaceholder />}
        <ShowroomHud />
        <VehicleExploration />

        <p className="sr-only">
          Interactive 3D concept vehicle in a cinematic showroom. Drag to orbit.
          Scroll or pinch to zoom within a limited range. Use Explore Vehicle to
          view design, wheels, and interior.
        </p>
      </ShowroomViewport>
    </div>
  );
}

function ShowroomPlaceholder() {
  return (
    <div className="absolute inset-0 bg-background" aria-hidden="true">
      <div className="absolute top-[8%] left-1/2 h-px w-2/5 -translate-x-1/2 bg-gradient-to-r from-transparent via-accent/70 to-transparent" />
    </div>
  );
}
