import type { ShowroomTier } from "@/features/showroom/config";

export type ExplorationMode = "showroom" | "exploring";

export type ExplorationPoint = "design" | "wheels" | "interior";

export type Vec3 = readonly [number, number, number];

export type ExplorationPreset = {
  id: ExplorationPoint;
  index: string;
  label: string;
  title: string;
  description: string;
  cameraPosition: Vec3;
  target: Vec3;
  fov: number;
  minDistance: number;
  maxDistance: number;
  minPolarAngle: number;
  maxPolarAngle: number;
};

export const EXPLORATION_POINTS = [
  "design",
  "wheels",
  "interior",
] as const satisfies readonly ExplorationPoint[];

const COPY: Record<
  ExplorationPoint,
  Pick<ExplorationPreset, "index" | "label" | "title" | "description">
> = {
  design: {
    index: "01",
    label: "DESIGN",
    title: "Sculpted Presence",
    description:
      "Proportion, surface and silhouette — read as one continuous form.",
  },
  wheels: {
    index: "02",
    label: "WHEELS",
    title: "Grounded Stance",
    description:
      "Wheel architecture and mechanical detail, held in a low, deliberate view.",
  },
  interior: {
    index: "03",
    label: "INTERIOR",
    title: "Driver Atmosphere",
    description:
      "A view into the cabin through glass — material, cockpit, and quiet focus.",
  },
};

const FRAMING: Record<
  ShowroomTier,
  Record<
    ExplorationPoint,
    Pick<
      ExplorationPreset,
      | "cameraPosition"
      | "target"
      | "fov"
      | "minDistance"
      | "maxDistance"
      | "minPolarAngle"
      | "maxPolarAngle"
    >
  >
> = {
  desktop: {
    design: {
      cameraPosition: [-2.48, 0.72, 3.18],
      target: [0, 0.3, 0.18],
      fov: 30,
      minDistance: 3.35,
      maxDistance: 5.7,
      minPolarAngle: Math.PI / 2.42,
      maxPolarAngle: Math.PI / 2.05,
    },
    wheels: {
      cameraPosition: [1.58, 0.2, 1.68],
      target: [0.4, 0.07, 0.84],
      fov: 32,
      minDistance: 1.2,
      maxDistance: 2.35,
      minPolarAngle: Math.PI / 2.18,
      maxPolarAngle: Math.PI / 2.02,
    },
    interior: {
      cameraPosition: [1.7, 0.56, 0.38],
      target: [0.04, 0.46, 0.06],
      fov: 34,
      minDistance: 1.4,
      maxDistance: 2.55,
      minPolarAngle: Math.PI / 2.32,
      maxPolarAngle: Math.PI / 2.08,
    },
  },
  tablet: {
    design: {
      cameraPosition: [-2.72, 0.8, 3.42],
      target: [0, 0.28, 0.16],
      fov: 32,
      minDistance: 3.7,
      maxDistance: 6.1,
      minPolarAngle: Math.PI / 2.4,
      maxPolarAngle: Math.PI / 2.05,
    },
    wheels: {
      cameraPosition: [1.82, 0.26, 1.9],
      target: [0.36, 0.08, 0.8],
      fov: 34,
      minDistance: 1.45,
      maxDistance: 2.7,
      minPolarAngle: Math.PI / 2.2,
      maxPolarAngle: Math.PI / 2.03,
    },
    interior: {
      cameraPosition: [1.92, 0.58, 0.52],
      target: [0.02, 0.45, 0.08],
      fov: 36,
      minDistance: 1.6,
      maxDistance: 2.9,
      minPolarAngle: Math.PI / 2.3,
      maxPolarAngle: Math.PI / 2.07,
    },
  },
  mobile: {
    design: {
      cameraPosition: [-3.05, 0.92, 3.95],
      target: [0, 0.28, 0.14],
      fov: 36,
      minDistance: 4.4,
      maxDistance: 7.0,
      minPolarAngle: Math.PI / 2.36,
      maxPolarAngle: Math.PI / 2.05,
    },
    wheels: {
      cameraPosition: [2.12, 0.36, 2.22],
      target: [0.3, 0.1, 0.72],
      fov: 36,
      minDistance: 1.9,
      maxDistance: 3.4,
      minPolarAngle: Math.PI / 2.22,
      maxPolarAngle: Math.PI / 2.03,
    },
    interior: {
      cameraPosition: [2.18, 0.62, 0.72],
      target: [0, 0.44, 0.1],
      fov: 38,
      minDistance: 2.0,
      maxDistance: 3.5,
      minPolarAngle: Math.PI / 2.28,
      maxPolarAngle: Math.PI / 2.06,
    },
  },
};

export function getExplorationPreset(
  point: ExplorationPoint,
  tier: ShowroomTier,
): ExplorationPreset {
  return {
    id: point,
    ...COPY[point],
    ...FRAMING[tier][point],
  };
}

export function getExplorationPresets(tier: ShowroomTier): ExplorationPreset[] {
  return EXPLORATION_POINTS.map((point) => getExplorationPreset(point, tier));
}

export function getAdjacentPoint(
  point: ExplorationPoint,
  direction: -1 | 1,
): ExplorationPoint {
  const index = EXPLORATION_POINTS.indexOf(point);
  const next =
    (index + direction + EXPLORATION_POINTS.length) % EXPLORATION_POINTS.length;
  return EXPLORATION_POINTS[next] ?? "design";
}
