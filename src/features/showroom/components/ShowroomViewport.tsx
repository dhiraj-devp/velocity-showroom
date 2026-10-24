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
const ShowroomPlayContext = createContext(false);

export function useShowroomRevealed() {
  return useContext(ShowroomRevealContext);
}

export function useShowroomPlaying() {
  return useContext(ShowroomPlayContext);
}

type ShowroomViewportProps = {
  children: ReactNode;
};

export function ShowroomViewport({ children }: ShowroomViewportProps) {
  const node = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const [revealed, setRevealed] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [settled, setSettled] = useState(true);
  const { mode } = useVehicleExploration();

  useEffect(() => {
    const target = node.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const visible = Boolean(entry?.isIntersecting);
        setPlaying(visible);
        if (visible) setRevealed(true);
      },
      { threshold: 0.08, rootMargin: "80px 0px" },
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let timer = 0;
    let paused = false;

    function onScroll() {
      if (!paused) {
        paused = true;
        setSettled(false);
      }
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        paused = false;
        setSettled(true);
      }, 160);
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.clearTimeout(timer);
    };
  }, []);

  const live = reducedMotion || revealed;
  const running = mode === "exploring" || (playing && settled);

  return (
    <div
      ref={node}
      data-revealed={live ? "true" : "false"}
      data-exploring={mode === "exploring" ? "true" : "false"}
      className="showroom-viewport relative h-[82vh] min-h-[36rem] overflow-hidden sm:h-[78vh] sm:min-h-[26rem] lg:h-[92vh]"
    >
      <ShowroomPlayContext.Provider value={running}>
        <ShowroomRevealContext.Provider value={live}>
          {children}
        </ShowroomRevealContext.Provider>
      </ShowroomPlayContext.Provider>
      <div className="showroom-reveal-veil pointer-events-none absolute inset-0 z-30" />
    </div>
  );
}
