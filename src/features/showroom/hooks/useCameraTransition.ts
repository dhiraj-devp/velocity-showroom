"use client";

import { useCallback, useRef } from "react";
import { Vector3, type PerspectiveCamera } from "three";

const SETTLE_POSITION = 0.028;
const SETTLE_TARGET = 0.022;
const DAMP_LAMBDA = 0.018;

export function useCameraTransition(reducedMotion: boolean) {
  const moving = useRef(false);
  const goalPosition = useRef(new Vector3());
  const goalLookAt = useRef(new Vector3());
  const goalFov = useRef(30);

  const start = useCallback(
    (position: readonly [number, number, number], target: readonly [number, number, number], fov: number) => {
      goalPosition.current.set(position[0], position[1], position[2]);
      goalLookAt.current.set(target[0], target[1], target[2]);
      goalFov.current = fov;
      moving.current = true;
    },
    [],
  );

  const cancel = useCallback(() => {
    moving.current = false;
  }, []);

  const tick = useCallback(
    (
      camera: PerspectiveCamera,
      target: Vector3,
      delta: number,
    ): boolean => {
      if (!moving.current) return false;

      if (reducedMotion) {
        camera.position.copy(goalPosition.current);
        target.copy(goalLookAt.current);
        camera.fov = goalFov.current;
        camera.updateProjectionMatrix();
        moving.current = false;
        return false;
      }

      const alpha = 1 - Math.pow(DAMP_LAMBDA, delta);
      camera.position.lerp(goalPosition.current, alpha);
      target.lerp(goalLookAt.current, alpha);
      camera.fov += (goalFov.current - camera.fov) * alpha;
      camera.updateProjectionMatrix();

      const arrived =
        camera.position.distanceTo(goalPosition.current) < SETTLE_POSITION &&
        target.distanceTo(goalLookAt.current) < SETTLE_TARGET;

      if (arrived) {
        camera.position.copy(goalPosition.current);
        target.copy(goalLookAt.current);
        camera.fov = goalFov.current;
        camera.updateProjectionMatrix();
        moving.current = false;
        return false;
      }

      return true;
    },
    [reducedMotion],
  );

  return { start, cancel, tick, moving };
}
