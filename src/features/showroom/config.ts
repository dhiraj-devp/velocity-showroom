export const SHOWROOM_BACKGROUND = "#050506";
export const SHOWROOM_ACCENT = "#c6a56a";

export const showroomPalette = {
  background: SHOWROOM_BACKGROUND,
  body: "#1b1c20",
  cabin: "#0c0d10",
  tire: "#09090b",
  wheel: "#2a2b30",
  accent: SHOWROOM_ACCENT,
  floor: "#09090b",
  wall: "#0c0c0f",
  wallRecess: "#080809",
  panel: "#121318",
  ceiling: "#070708",
  platform: "#0b0b0e",
  platformTrim: "#6f7278",
  keyLight: "#f3efe6",
  rimLight: SHOWROOM_ACCENT,
  fillLight: "#7d8aa3",
} as const;

export const showroomCopy = {
  brand: "VELOCITY",
  experience: "IMMERSIVE EXPERIENCE",
  collection: "COLLECTION / 01",
  vehicleName: "VELOCITY CONCEPT",
  hintDesktop: "DRAG TO EXPLORE",
  hintMobile: "SWIPE TO EXPLORE",
  explore: "EXPLORE VEHICLE",
} as const;

export const PLATFORM_TOP = -0.275;
export const FLOOR_Y = -0.4;
export const VEHICLE_LOOK_AT = [0, 0.26, 0.38] as const;

export type ShowroomTier = "mobile" | "tablet" | "desktop";

export type ShowroomQuality = {
  tier: ShowroomTier;
  fov: number;
  minDistance: number;
  maxDistance: number;
  minPolarAngle: number;
  maxPolarAngle: number;
  cameraPosition: readonly [number, number, number];
  introCameraPosition: readonly [number, number, number];
  target: readonly [number, number, number];
  heroScale: number;
  far: number;
  dpr: readonly [number, number];
  fogDensity: number;
  panelCount: number;
  beamCount: number;
  showCeiling: boolean;
  showReflector: boolean;
  reflectorResolution: number;
  reflectorRadius: number;
  envResolution: number;
  extraLights: boolean;
};

export function getShowroomQuality(width: number): ShowroomQuality {
  const target = VEHICLE_LOOK_AT;

  if (width < 640) {
    return {
      tier: "mobile",
      fov: 37,
      minDistance: 5.0,
      maxDistance: 7.8,
      minPolarAngle: Math.PI / 2.38,
      maxPolarAngle: Math.PI / 2.05,
      cameraPosition: [3.7, 0.98, 4.35],
      introCameraPosition: [4.05, 1.14, 4.75],
      target,
      heroScale: 1,
      far: 22,
      dpr: [1, 1.25],
      fogDensity: 0.036,
      panelCount: 2,
      beamCount: 0,
      showCeiling: false,
      showReflector: false,
      reflectorResolution: 128,
      reflectorRadius: 3.4,
      envResolution: 128,
      extraLights: false,
    };
  }

  if (width < 1024) {
    return {
      tier: "tablet",
      fov: 33,
      minDistance: 4.15,
      maxDistance: 7.0,
      minPolarAngle: Math.PI / 2.42,
      maxPolarAngle: Math.PI / 2.06,
      cameraPosition: [3.05, 0.84, 3.55],
      introCameraPosition: [3.4, 1.0, 3.95],
      target,
      heroScale: 1,
      far: 26,
      dpr: [1, 1.5],
      fogDensity: 0.026,
      panelCount: 4,
      beamCount: 1,
      showCeiling: true,
      showReflector: true,
      reflectorResolution: 256,
      reflectorRadius: 4.2,
      envResolution: 192,
      extraLights: false,
    };
  }

  return {
    tier: "desktop",
    fov: 30,
    minDistance: 3.85,
    maxDistance: 6.8,
    minPolarAngle: Math.PI / 2.45,
    maxPolarAngle: Math.PI / 2.06,
    cameraPosition: [2.92, 0.78, 3.38],
    introCameraPosition: [3.28, 0.94, 3.78],
    target,
    heroScale: 1,
    far: 28,
    dpr: [1, 1.5],
    fogDensity: 0.018,
    panelCount: 6,
    beamCount: 2,
    showCeiling: true,
    showReflector: true,
    reflectorResolution: 384,
    reflectorRadius: 5,
    envResolution: 256,
    extraLights: true,
  };
}
