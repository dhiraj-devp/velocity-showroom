"use client";

import { useEffect, useMemo } from "react";
import { MeshStandardMaterial } from "three";
import { showroomPalette } from "@/features/showroom/config";

export type ShowroomMaterials = ReturnType<typeof useShowroomMaterials>;

export function useShowroomMaterials() {
  const materials = useMemo(
    () => ({
      floor: new MeshStandardMaterial({
        color: showroomPalette.floor,
        metalness: 0.42,
        roughness: 0.78,
      }),
      wall: new MeshStandardMaterial({
        color: showroomPalette.wall,
        metalness: 0.22,
        roughness: 0.86,
      }),
      recess: new MeshStandardMaterial({
        color: showroomPalette.wallRecess,
        metalness: 0.18,
        roughness: 0.9,
      }),
      panel: new MeshStandardMaterial({
        color: showroomPalette.panel,
        metalness: 0.34,
        roughness: 0.62,
      }),
      ceiling: new MeshStandardMaterial({
        color: showroomPalette.ceiling,
        metalness: 0.2,
        roughness: 0.88,
      }),
      platform: new MeshStandardMaterial({
        color: showroomPalette.platform,
        metalness: 0.38,
        roughness: 0.62,
      }),
      platformTrim: new MeshStandardMaterial({
        color: showroomPalette.platformTrim,
        metalness: 0.92,
        roughness: 0.28,
      }),
      edgeLight: new MeshStandardMaterial({
        color: showroomPalette.fillLight,
        emissive: showroomPalette.fillLight,
        emissiveIntensity: 0.18,
        metalness: 0.35,
        roughness: 0.55,
      }),
    }),
    [],
  );

  useEffect(() => {
    return () => {
      for (const material of Object.values(materials)) {
        material.dispose();
      }
    };
  }, [materials]);

  return materials;
}
