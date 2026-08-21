"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { ExplorationNavigation } from "@/features/showroom/components/ExplorationNavigation";
import { ExplorationPanel } from "@/features/showroom/components/ExplorationPanel";
import { getExplorationPreset } from "@/features/showroom/config/explorationPresets";
import { getShowroomQuality, showroomCopy } from "@/features/showroom/config";
import { useVehicleExploration } from "@/features/showroom/hooks/useVehicleExploration";

function subscribeResize(onStoreChange: () => void) {
  window.addEventListener("resize", onStoreChange);
  return () => window.removeEventListener("resize", onStoreChange);
}

export function VehicleExploration() {
  const exploration = useVehicleExploration();
  const width = useSyncExternalStore(
    subscribeResize,
    () => window.innerWidth,
    () => 1280,
  );
  const quality = getShowroomQuality(width);
  const preset = getExplorationPreset(exploration.point, quality.tier);

  const prevMode = useRef(exploration.mode);

  useEffect(() => {
    if (exploration.mode !== "exploring") return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        exploration.returnToShowroom();
        return;
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        exploration.nextPoint();
        return;
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        exploration.previousPoint();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [exploration]);

  useEffect(() => {
    const previous = prevMode.current;
    prevMode.current = exploration.mode;

    if (exploration.mode === "exploring") {
      document.getElementById("exploration-panel")?.focus();
      return;
    }

    if (previous === "exploring") {
      document.getElementById("explore-vehicle")?.focus();
    }
  }, [exploration.mode]);

  if (exploration.mode !== "exploring") {
    return (
      <div className="exploration-shell">
        <button
          id="explore-vehicle"
          type="button"
          className="exploration-enter"
          onClick={() => exploration.enterExploration("design")}
        >
          {showroomCopy.explore}
        </button>
      </div>
    );
  }

  return (
    <div className="exploration-shell" data-active="true">
      <ExplorationNavigation
        active={exploration.point}
        onSelect={exploration.selectPoint}
      />
      <ExplorationPanel
        preset={preset}
        pointCount={exploration.pointCount}
        onPrevious={exploration.previousPoint}
        onNext={exploration.nextPoint}
        onBack={exploration.returnToShowroom}
      />
    </div>
  );
}
