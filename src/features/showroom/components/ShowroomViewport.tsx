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
import { setShowroomScrollProgress } from "@/features/showroom/lib/scrollProgress";

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

  useEffect(() => {
    const target = node.current;
    if (!target) return;

    let frame = 0;
    const stage = target;
    const mobileQuery = window.matchMedia("(max-width: 639px)");

    function update() {
      frame = 0;
      if (reducedMotion || mobileQuery.matches) {
        setShowroomScrollProgress(0);
        return;
      }

      const rect = stage.getBoundingClientRect();
      const vh = window.innerHeight;
      const start = vh * 0.92;
      const end = -rect.height * 0.35;
      const t = (start - rect.top) / (start - end);
      setShowroomScrollProgress(t < 0 ? 0 : t > 1 ? 1 : t);
    }

    function onScroll() {
      if (frame) return;
      frame = requestAnimationFrame(update);
    }

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    mobileQuery.addEventListener("change", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      mobileQuery.removeEventListener("change", onScroll);
      if (frame) cancelAnimationFrame(frame);
      setShowroomScrollProgress(0);
    };
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
