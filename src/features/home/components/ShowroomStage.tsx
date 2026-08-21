import { ShowroomCanvas } from "@/features/showroom/components/ShowroomCanvas";
import { ShowroomHud } from "@/features/showroom/components/ShowroomHud";
import { ShowroomViewport } from "@/features/showroom/components/ShowroomViewport";
import { VehicleExploration } from "@/features/showroom/components/VehicleExploration";

/**
 * Integration boundary for the showroom visual.
 * Homepage sections should keep depending on this component, not on Three.js internals.
 */
export function ShowroomStage() {
  return (
    <ShowroomViewport>
      <ShowroomCanvas />
      <ShowroomHud />
      <VehicleExploration />

      <p className="sr-only">
        Interactive 3D concept vehicle in a cinematic showroom. Drag to orbit.
        Scroll or pinch to zoom within a limited range. Use Explore Vehicle to
        view design, wheels, and interior.
      </p>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-[18%] top-[10%] z-10 h-16 bg-[radial-gradient(ellipse_at_center,rgba(255,247,230,0.05),transparent_70%)] blur-2xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(ellipse_at_center,transparent_64%,rgba(5,5,6,0.18)_100%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-10 shadow-[inset_0_0_56px_rgba(5,5,6,0.18)]"
      />
    </ShowroomViewport>
  );
}
