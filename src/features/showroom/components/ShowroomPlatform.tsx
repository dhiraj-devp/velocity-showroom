"use client";

import { FLOOR_Y, PLATFORM_TOP } from "@/features/showroom/config";
import type { ShowroomMaterials } from "@/features/showroom/hooks/useShowroomMaterials";

const PLATFORM_HEIGHT = PLATFORM_TOP - FLOOR_Y;
const PLATFORM_LENGTH = 3.18;
const PLATFORM_WIDTH = 1.42;
const EDGE = 0.012;

export function ShowroomPlatform({
  materials,
}: {
  materials: ShowroomMaterials;
}) {
  const centerY = FLOOR_Y + PLATFORM_HEIGHT / 2;
  const topY = PLATFORM_TOP;

  return (
    <group>
      <mesh position={[0, centerY, 0]} material={materials.platform}>
        <boxGeometry args={[PLATFORM_LENGTH, PLATFORM_HEIGHT, PLATFORM_WIDTH]} />
      </mesh>

      <mesh
        position={[0, topY + 0.001, PLATFORM_WIDTH / 2]}
        material={materials.platformTrim}
      >
        <boxGeometry args={[PLATFORM_LENGTH, EDGE, EDGE]} />
      </mesh>
      <mesh
        position={[0, topY + 0.001, -PLATFORM_WIDTH / 2]}
        material={materials.platformTrim}
      >
        <boxGeometry args={[PLATFORM_LENGTH, EDGE, EDGE]} />
      </mesh>
      <mesh
        position={[PLATFORM_LENGTH / 2, topY + 0.001, 0]}
        material={materials.platformTrim}
      >
        <boxGeometry args={[EDGE, EDGE, PLATFORM_WIDTH]} />
      </mesh>
      <mesh
        position={[-PLATFORM_LENGTH / 2, topY + 0.001, 0]}
        material={materials.platformTrim}
      >
        <boxGeometry args={[EDGE, EDGE, PLATFORM_WIDTH]} />
      </mesh>

      <mesh
        position={[0, FLOOR_Y + 0.006, PLATFORM_WIDTH / 2 + 0.01]}
        material={materials.edgeLight}
      >
        <boxGeometry args={[PLATFORM_LENGTH - 0.08, 0.006, 0.01]} />
      </mesh>
      <mesh
        position={[0, FLOOR_Y + 0.006, -PLATFORM_WIDTH / 2 - 0.01]}
        material={materials.edgeLight}
      >
        <boxGeometry args={[PLATFORM_LENGTH - 0.08, 0.006, 0.01]} />
      </mesh>
      <mesh
        position={[PLATFORM_LENGTH / 2 + 0.01, FLOOR_Y + 0.006, 0]}
        material={materials.edgeLight}
      >
        <boxGeometry args={[0.01, 0.006, PLATFORM_WIDTH - 0.08]} />
      </mesh>
      <mesh
        position={[-PLATFORM_LENGTH / 2 - 0.01, FLOOR_Y + 0.006, 0]}
        material={materials.edgeLight}
      >
        <boxGeometry args={[0.01, 0.006, PLATFORM_WIDTH - 0.08]} />
      </mesh>
    </group>
  );
}
