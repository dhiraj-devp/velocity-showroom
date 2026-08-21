"use client";

import { useGLTF } from "@react-three/drei";
import { useMemo } from "react";
import type { Object3D } from "three";
import {
  CAR_MODEL_PATH,
  computeModelNormalization,
  prepareCarMaterials,
} from "@/features/showroom/lib/normalizeModel";

useGLTF.preload(CAR_MODEL_PATH);

export function CarModel() {
  const { scene } = useGLTF(CAR_MODEL_PATH);

  const normalization = useMemo(() => {
    scene.position.set(0, 0, 0);
    scene.rotation.set(0, 0, 0);
    scene.scale.set(1, 1, 1);
    scene.updateMatrixWorld(true);
    prepareCarMaterials(scene);
    return computeModelNormalization(scene);
  }, [scene]);

  return (
    <group
      position={normalization.outerPosition}
      rotation={normalization.rotation}
      scale={normalization.scale}
    >
      <group position={normalization.innerPosition}>
        <primitive object={scene as Object3D} />
      </group>
    </group>
  );
}
