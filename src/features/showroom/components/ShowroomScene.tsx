"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { Suspense, useRef, type ReactNode } from "react";
import type { Group, PerspectiveCamera } from "three";
import { ArchitecturalLights } from "@/features/showroom/components/ArchitecturalLights";
import { CameraController } from "@/features/showroom/components/CameraController";
import { CarModel } from "@/features/showroom/components/CarModel";
import { ShowroomEnvironment } from "@/features/showroom/components/ShowroomEnvironment";
import { ShowroomPlatform } from "@/features/showroom/components/ShowroomPlatform";
import { VehicleErrorBoundary } from "@/features/showroom/components/VehicleLoadingOverlay";
import {
  SHOWROOM_BACKGROUND,
  getShowroomQuality,
} from "@/features/showroom/config";
import { useShowroomMaterials } from "@/features/showroom/hooks/useShowroomMaterials";
import { useVehicleExploration } from "@/features/showroom/hooks/useVehicleExploration";

type ShowroomSceneProps = {
  reducedMotion: boolean;
  onVehicleError: () => void;
};

export function ShowroomScene({
  reducedMotion,
  onVehicleError,
}: ShowroomSceneProps) {
  const width = useThree((state) => state.size.width);
  const quality = getShowroomQuality(width);
  const materials = useShowroomMaterials();
  const { mode } = useVehicleExploration();
  const exploring = mode === "exploring";

  return (
    <>
      <color attach="background" args={[SHOWROOM_BACKGROUND]} />
      <fogExp2 attach="fog" args={[SHOWROOM_BACKGROUND, quality.fogDensity]} />
      <ResponsiveFov fov={quality.fov} locked={exploring} />

      <ArchitecturalLights quality={quality} reducedMotion={reducedMotion} />
      <ShowroomEnvironment quality={quality} materials={materials} />

      <HeroTurntable
        reducedMotion={reducedMotion}
        exploring={exploring}
        scale={quality.heroScale}
      >
        <ShowroomPlatform materials={materials} />
        <VehicleErrorBoundary onError={onVehicleError}>
          <Suspense fallback={null}>
            <CarModel />
          </Suspense>
        </VehicleErrorBoundary>
      </HeroTurntable>

      <CameraController quality={quality} reducedMotion={reducedMotion} />
    </>
  );
}

function HeroTurntable({
  reducedMotion,
  exploring,
  scale,
  children,
}: {
  reducedMotion: boolean;
  exploring: boolean;
  scale: number;
  children: ReactNode;
}) {
  const group = useRef<Group>(null);

  useFrame((_, delta) => {
    if (!group.current) return;

    if (reducedMotion) {
      group.current.rotation.y = 0;
      return;
    }

    if (exploring) {
      const tau = Math.PI * 2;
      let yaw = group.current.rotation.y % tau;
      if (yaw > Math.PI) yaw -= tau;
      if (yaw < -Math.PI) yaw += tau;
      if (Math.abs(yaw) < 0.002) {
        group.current.rotation.y = 0;
        return;
      }
      const alpha = 1 - Math.pow(0.012, delta);
      group.current.rotation.y = yaw * (1 - alpha);
      return;
    }

    group.current.rotation.y += delta * 0.035;
  });

  return (
    <group ref={group} scale={scale}>
      {children}
    </group>
  );
}

function ResponsiveFov({ fov, locked }: { fov: number; locked: boolean }) {
  useFrame(({ camera }) => {
    if (locked) return;
    const perspective = camera as PerspectiveCamera;
    if (!perspective.isPerspectiveCamera || perspective.fov === fov) return;
    perspective.fov = fov;
    perspective.updateProjectionMatrix();
  });

  return null;
}
