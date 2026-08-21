"use client";

import { OrbitControls } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import type { PerspectiveCamera } from "three";
import { useShowroomRevealed } from "@/features/showroom/components/ShowroomViewport";
import { getExplorationPreset } from "@/features/showroom/config/explorationPresets";
import type { ShowroomQuality } from "@/features/showroom/config";
import { useCameraTransition } from "@/features/showroom/hooks/useCameraTransition";
import { useVehicleExploration } from "@/features/showroom/hooks/useVehicleExploration";

type CameraControllerProps = {
  quality: ShowroomQuality;
  reducedMotion: boolean;
};

export function CameraController({
  quality,
  reducedMotion,
}: CameraControllerProps) {
  const { mode, point, requestId } = useVehicleExploration();
  const revealed = useShowroomRevealed();
  const invalidate = useThree((state) => state.invalidate);
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const { start, cancel, tick, moving } = useCameraTransition(reducedMotion);
  const [settledId, setSettledId] = useState(-1);
  const introArmed = useRef(false);
  const lastRequest = useRef(0);
  const pendingLimits = useRef(false);
  const [camX, camY, camZ] = quality.cameraPosition;
  const showroomFov = quality.fov;
  const tier = quality.tier;
  const showroomTarget = quality.target;
  const orbitEnabled = settledId === requestId;

  useEffect(() => {
    if (mode === "exploring") {
      const preset = getExplorationPreset(point, tier);
      start(preset.cameraPosition, preset.target, preset.fov);
      introArmed.current = true;
      lastRequest.current = requestId;
      pendingLimits.current = true;
      invalidate();
      return;
    }

    if (requestId === lastRequest.current) return;
    lastRequest.current = requestId;
    start([camX, camY, camZ], showroomTarget, showroomFov);
    pendingLimits.current = true;
    invalidate();
  }, [
    camX,
    camY,
    camZ,
    invalidate,
    mode,
    point,
    requestId,
    showroomFov,
    showroomTarget,
    start,
    tier,
  ]);

  useEffect(() => {
    if (introArmed.current || !revealed || mode !== "showroom") return;
    introArmed.current = true;
    if (reducedMotion) {
      pendingLimits.current = true;
      invalidate();
      return;
    }
    start([camX, camY, camZ], showroomTarget, showroomFov);
    pendingLimits.current = true;
  }, [
    camX,
    camY,
    camZ,
    mode,
    reducedMotion,
    revealed,
    showroomFov,
    showroomTarget,
    start,
    invalidate,
  ]);

  useFrame(({ camera }, delta) => {
    const controls = controlsRef.current;
    const perspective = camera as PerspectiveCamera;
    if (!controls || !perspective.isPerspectiveCamera) return;

    const inMotion = tick(perspective, controls.target, delta);
    if (inMotion) {
      controls.enabled = false;
      perspective.lookAt(controls.target);
      return;
    }

    if (pendingLimits.current) {
      pendingLimits.current = false;
      applyDestinationLimits(controls, mode, point, quality);
      setSettledId(requestId);
    }
  });

  const exploring = mode === "exploring";
  const preset = exploring ? getExplorationPreset(point, tier) : null;
  const limits = orbitEnabled && preset ? preset : quality;

  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      enablePan={false}
      enabled={orbitEnabled}
      enableDamping={!reducedMotion}
      dampingFactor={0.08}
      rotateSpeed={0.34}
      zoomSpeed={0.38}
      minPolarAngle={limits.minPolarAngle}
      maxPolarAngle={limits.maxPolarAngle}
      minDistance={orbitEnabled ? limits.minDistance : 0.85}
      maxDistance={orbitEnabled ? limits.maxDistance : 12}
      target={showroomTarget as unknown as [number, number, number]}
      onStart={() => {
        if (moving.current) {
          cancel();
          pendingLimits.current = false;
        }
        introArmed.current = true;
        setSettledId(requestId);
      }}
    />
  );
}

function applyDestinationLimits(
  controls: OrbitControlsImpl,
  mode: "showroom" | "exploring",
  point: "design" | "wheels" | "interior",
  quality: ShowroomQuality,
) {
  if (mode === "exploring") {
    const preset = getExplorationPreset(point, quality.tier);
    controls.minDistance = preset.minDistance;
    controls.maxDistance = preset.maxDistance;
    controls.minPolarAngle = preset.minPolarAngle;
    controls.maxPolarAngle = preset.maxPolarAngle;
    return;
  }

  controls.minDistance = quality.minDistance;
  controls.maxDistance = quality.maxDistance;
  controls.minPolarAngle = quality.minPolarAngle;
  controls.maxPolarAngle = quality.maxPolarAngle;
}
