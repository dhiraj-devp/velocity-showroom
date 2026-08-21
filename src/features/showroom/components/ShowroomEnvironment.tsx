"use client";

import { MeshReflectorMaterial } from "@react-three/drei";
import { useLayoutEffect, useMemo, useRef } from "react";
import { InstancedMesh, Object3D, type MeshStandardMaterial } from "three";
import {
  FLOOR_Y,
  type ShowroomQuality,
  showroomPalette,
} from "@/features/showroom/config";
import type { ShowroomMaterials } from "@/features/showroom/hooks/useShowroomMaterials";

type ShowroomEnvironmentProps = {
  quality: ShowroomQuality;
  materials: ShowroomMaterials;
};

export function ShowroomEnvironment({
  quality,
  materials,
}: ShowroomEnvironmentProps) {

  return (
    <group>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, FLOOR_Y, 0]}
        material={materials.floor}
      >
        <planeGeometry args={[22, 22]} />
      </mesh>

      {quality.showReflector ? (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, FLOOR_Y + 0.004, 0]}>
          <circleGeometry args={[quality.reflectorRadius, 48]} />
          <MeshReflectorMaterial
            color={showroomPalette.floor}
            metalness={0.58}
            roughness={0.9}
            resolution={quality.reflectorResolution}
            mirror={0.12}
            mixBlur={1.1}
            mixStrength={0.24}
            blur={[140, 40]}
            reflectorOffset={0.02}
          />
        </mesh>
      ) : null}

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, FLOOR_Y + 0.006, 0]}>
        <planeGeometry args={[3.05, 1.32]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.42} />
      </mesh>

      <mesh position={[0.78, FLOOR_Y + 0.007, -2.4]} material={materials.platformTrim}>
        <boxGeometry args={[0.012, 0.004, 9.2]} />
      </mesh>
      <mesh position={[-0.78, FLOOR_Y + 0.007, -2.4]} material={materials.platformTrim}>
        <boxGeometry args={[0.012, 0.004, 9.2]} />
      </mesh>

      <mesh position={[0, 2.55, -7.4]} material={materials.wall}>
        <planeGeometry args={[22, 7]} />
      </mesh>
      <mesh position={[0, 2.35, -7.85]} material={materials.recess}>
        <planeGeometry args={[12, 5.2]} />
      </mesh>
      <mesh position={[0, 2.15, -8.05]}>
        <planeGeometry args={[9.2, 2.8]} />
        <meshBasicMaterial
          color={showroomPalette.fillLight}
          transparent
          opacity={0.08}
        />
      </mesh>

      <mesh position={[0, FLOOR_Y + 0.08, -7.38]} material={materials.platformTrim}>
        <boxGeometry args={[22, 0.016, 0.04]} />
      </mesh>
      <mesh position={[0, 3.55, -7.36]} material={materials.edgeLight}>
        <boxGeometry args={[10.5, 0.018, 0.04]} />
      </mesh>

      <SidePanels count={quality.panelCount} material={materials.panel} />

      {quality.showCeiling ? (
        <mesh
          rotation={[Math.PI / 2, 0, 0]}
          position={[0, 5.35, -1.4]}
          material={materials.ceiling}
        >
          <planeGeometry args={[22, 14]} />
        </mesh>
      ) : null}

      <CeilingBeams count={quality.beamCount} material={materials.panel} />
    </group>
  );
}

function SidePanels({
  count,
  material,
}: {
  count: number;
  material: MeshStandardMaterial;
}) {
  const mesh = useRef<InstancedMesh>(null);
  const dummy = useMemo(() => new Object3D(), []);
  const transforms = useMemo(() => getPanelTransforms(count), [count]);

  useLayoutEffect(() => {
    const instance = mesh.current;
    if (!instance) return;

    transforms.forEach((transform, index) => {
      dummy.position.set(transform.x, transform.y, transform.z);
      dummy.rotation.set(0, transform.ry, 0);
      dummy.scale.set(1, transform.scaleY, 1);
      dummy.updateMatrix();
      instance.setMatrixAt(index, dummy.matrix);
    });
    instance.instanceMatrix.needsUpdate = true;
  }, [dummy, transforms]);

  if (count === 0) return null;

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, count]} material={material}>
      <boxGeometry args={[0.08, 3.6, 1.15]} />
    </instancedMesh>
  );
}

function CeilingBeams({
  count,
  material,
}: {
  count: number;
  material: MeshStandardMaterial;
}) {
  const mesh = useRef<InstancedMesh>(null);
  const dummy = useMemo(() => new Object3D(), []);

  useLayoutEffect(() => {
    const instance = mesh.current;
    if (!instance || count === 0) return;
    const zs = count === 1 ? [-3.2] : [-1.8, -4.6];

    zs.forEach((z, index) => {
      dummy.position.set(0, 5.28, z);
      dummy.rotation.set(0, 0, 0);
      dummy.scale.set(1, 1, 1);
      dummy.updateMatrix();
      instance.setMatrixAt(index, dummy.matrix);
    });
    instance.instanceMatrix.needsUpdate = true;
  }, [count, dummy]);

  if (count === 0) return null;

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, count]} material={material}>
      <boxGeometry args={[16, 0.06, 0.28]} />
    </instancedMesh>
  );
}

function getPanelTransforms(count: number) {
  const zs =
    count <= 2 ? [-4] : count <= 4 ? [-2.4, -5.2] : [-2.1, -4.1, -6.05];
  const xs = [-5.7, 5.7] as const;

  return zs.flatMap((z, index) =>
    xs.map((x) => ({
      x,
      y: 1.55,
      z,
      ry: x > 0 ? -0.12 : 0.12,
      scaleY: 1 - index * 0.04,
    })),
  );
}
