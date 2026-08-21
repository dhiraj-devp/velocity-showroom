"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useReducedMotion } from "@/features/showroom/hooks/useReducedMotion";
import { useVehicleExploration } from "@/features/showroom/hooks/useVehicleExploration";

const ShowroomRevealContext = createContext(true);

export function useShowroomRevealed() {
  return useContext(ShowroomRevealContext);
}

type ShowroomViewportProps = {
  children: ReactNode;
};

export function ShowroomViewport({ children }: ShowroomViewportProps) {
  const node = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const [revealed, setRevealed] = useState(false);
  const { mode } = useVehicleExploration();

  useEffect(() => {
    if (reducedMotion) return;

    const target = node.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        setRevealed(true);
        observer.disconnect();
      },
      { threshold: 0.32, rootMargin: "0px 0px -12% 0px" },
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [reducedMotion]);

  const live = reducedMotion || revealed;

  return (
    <div
      ref={node}
      data-revealed={live ? "true" : "false"}
      data-exploring={mode === "exploring" ? "true" : "false"}
      className="showroom-viewport relative h-[68vh] min-h-[26rem] overflow-hidden sm:h-[78vh] lg:h-[92vh]"
    >
      <ShowroomRevealContext.Provider value={live}>
        {children}
      </ShowroomRevealContext.Provider>
      <div className="showroom-reveal-veil pointer-events-none absolute inset-0 z-30" />
    </div>
  );
}
