"use client";

import { Environment, Lightformer } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { Group, Mesh, MeshStandardMaterial, type SpotLight } from "three";
import { useShowroomRevealed } from "@/features/showroom/components/ShowroomViewport";
import {
  VEHICLE_LOOK_AT,
  type ShowroomQuality,
  showroomPalette,
} from "@/features/showroom/config";

type ArchitecturalLightsProps = {
  quality: ShowroomQuality;
  reducedMotion: boolean;
};

export function ArchitecturalLights({
  quality,
  reducedMotion,
}: ArchitecturalLightsProps) {
  const strips = useRef<Group>(null);
  const key = useRef<SpotLight>(null);
  const rim = useRef<SpotLight>(null);
  const cool = useRef<SpotLight>(null);
  const revealed = useShowroomRevealed();
  const intensityMul = useRef(revealed || reducedMotion ? 1 : 0.62);

  useFrame((state, delta) => {
    const goal = revealed || reducedMotion ? 1 : 0.62;
    intensityMul.current += (goal - intensityMul.current) * Math.min(1, delta * 2.2);

    aimSpot(key.current, 3.05 * intensityMul.current);
    aimSpot(rim.current, 2.15 * intensityMul.current);
    aimSpot(cool.current, 1.25 * intensityMul.current);

    const group = strips.current;
    if (!group) return;
    const pulse = reducedMotion
      ? 0.42
      : 0.4 + Math.sin(state.clock.elapsedTime * 0.35) * 0.08;
    group.traverse((child) => {
      if (!(child instanceof Mesh)) return;
      if (child.material instanceof MeshStandardMaterial) {
        child.material.emissiveIntensity = pulse * intensityMul.current;
      }
    });
  });

  return (
    <>
      <ambientLight intensity={0.034} color={showroomPalette.keyLight} />
      <spotLight
        ref={key}
        position={[2.55, 3.25, 2.85]}
        angle={0.36}
        penumbra={0.92}
        color={showroomPalette.keyLight}
        distance={16}
      />
      <spotLight
        ref={rim}
        position={[-2.85, 1.72, -2.55]}
        angle={0.48}
        penumbra={1}
        color={showroomPalette.rimLight}
        distance={14}
      />
      <spotLight
        ref={cool}
        position={[-2.45, 1.28, 2.55]}
        angle={0.5}
        penumbra={1}
        color={showroomPalette.fillLight}
        distance={12}
      />
      <pointLight
        position={[0.35, 1.05, 1.65]}
        intensity={0.18}
        color={showroomPalette.keyLight}
        distance={5}
      />
      <pointLight
        position={[0, 2.55, -6.2]}
        intensity={0.72}
        color="#b7c0d4"
        distance={14}
      />
      <pointLight
        position={[-2.8, 0.9, 2.0]}
        intensity={0.22}
        color={showroomPalette.fillLight}
        distance={8}
      />
      {quality.extraLights ? (
        <spotLight
          position={[0.15, 5.15, 0.35]}
          intensity={0.42}
          angle={0.48}
          penumbra={1}
          color={showroomPalette.keyLight}
        />
      ) : null}

      <group ref={strips}>
        <mesh position={[-5.55, 1.7, -3.8]}>
          <boxGeometry args={[0.03, 2.8, 0.03]} />
          <meshStandardMaterial
            color={showroomPalette.accent}
            emissive={showroomPalette.accent}
            emissiveIntensity={0.42}
            metalness={0.55}
            roughness={0.4}
          />
        </mesh>
        <mesh position={[5.55, 1.7, -3.8]}>
          <boxGeometry args={[0.03, 2.8, 0.03]} />
          <meshStandardMaterial
            color={showroomPalette.accent}
            emissive={showroomPalette.accent}
            emissiveIntensity={0.42}
            metalness={0.55}
            roughness={0.4}
          />
        </mesh>
        {quality.extraLights ? (
          <mesh position={[0, 5.2, -3.2]}>
            <boxGeometry args={[8.5, 0.02, 0.04]} />
            <meshStandardMaterial
              color={showroomPalette.fillLight}
              emissive={showroomPalette.fillLight}
              emissiveIntensity={0.42}
              metalness={0.55}
              roughness={0.4}
            />
          </mesh>
        ) : null}
      </group>

      <Environment
        frames={1}
        resolution={quality.envResolution}
        environmentIntensity={0.58}
      >
        <Lightformer
          form="rect"
          intensity={2.35}
          color="#f7f3ea"
          position={[0, 4.85, 0.2]}
          rotation-x={Math.PI / 2}
          scale={[5.2, 0.48, 1]}
        />
        <Lightformer
          form="rect"
          intensity={0.85}
          color={showroomPalette.keyLight}
          position={[0, 4.6, 1.2]}
          rotation-x={Math.PI / 2}
          scale={[6, 4.5, 1]}
        />
        <Lightformer
          form="rect"
          intensity={1.05}
          color={showroomPalette.rimLight}
          position={[3.6, 1.35, -1.55]}
          scale={[1.4, 3.6, 1]}
        />
        {quality.extraLights ? (
          <Lightformer
            form="rect"
            intensity={0.42}
            color={showroomPalette.fillLight}
            position={[-3.8, 1.05, 1.8]}
            scale={[1.8, 2.6, 1]}
          />
        ) : null}
      </Environment>
    </>
  );
}

function aimSpot(light: SpotLight | null, intensity: number) {
  if (!light) return;
  light.intensity = intensity;
  if (light.parent && light.target.parent !== light.parent) {
    light.parent.add(light.target);
  }
  light.target.position.set(
    VEHICLE_LOOK_AT[0],
    VEHICLE_LOOK_AT[1],
    VEHICLE_LOOK_AT[2],
  );
  light.target.updateMatrixWorld();
}
