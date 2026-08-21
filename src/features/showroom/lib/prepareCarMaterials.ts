import { DoubleSide, type Material, type Mesh, type Object3D, type Texture } from "three";

type StandardLike = Material & {
  metalness: number;
  roughness: number;
  envMapIntensity: number;
  color: { r: number; g: number; b: number; setRGB: (r: number, g: number, b: number) => void };
  transparent: boolean;
  opacity: number;
  depthWrite: boolean;
  side: number;
  emissiveIntensity?: number;
  clearcoat?: number;
  clearcoatRoughness?: number;
  transmission?: number;
  ior?: number;
  metalnessMap?: Texture | null;
};

export function prepareCarMaterials(root: Object3D) {
  root.traverse((child) => {
    if (!isMesh(child)) return;

    const materials = Array.isArray(child.material)
      ? child.material
      : [child.material];

    for (const material of materials) {
      polishMaterial(material);
    }
  });
}

function polishMaterial(material: Material) {
  const name = material.name.toLowerCase();
  const role = classifyMaterial(name, material);

  if (isStandardLike(material)) {
    applyRole(material, role);
  }

  material.needsUpdate = true;
}

function classifyMaterial(
  name: string,
  material: Material,
): MaterialRole {
  if (name === "composit") return "paint";
  if (name === "jant") return "rim";
  if (name === "disk") return "rotor";
  if (name === "red") return "caliper";
  if (name === "tire") return "tire";
  if (name === "silver") return "chrome";
  if (name === "black") return "trim";
  if (name === "leather") return "leather";
  if (name === "logo") return "logo";
  if (name === "mirror" || name.includes("mirror")) return "mirror";
  if (name === "red glass") return "red-glass";
  if (name === "light" || name === "red light") return "lamp";
  if (
    name.includes("glass") ||
    name.includes("vidro") ||
    ("transmission" in material &&
      typeof material.transmission === "number" &&
      material.transmission > 0)
  ) {
    return "glass";
  }

  return "other";
}

function applyRole(material: StandardLike, role: MaterialRole) {
  if (material.envMapIntensity === 0) {
    material.envMapIntensity = 1;
  }

  switch (role) {
    case "paint":
      // Authored roughness is omitted in the GLB (glTF default 1), which reads as matte.
      material.roughness = 0.28;
      material.metalness = 0.22;
      material.envMapIntensity = 1.55;
      if (typeof material.clearcoat === "number") {
        material.clearcoat = 0.72;
        material.clearcoatRoughness = 0.16;
      }
      break;
    case "glass":
      material.metalness = 0;
      material.roughness = 0.06;
      material.envMapIntensity = 1.7;
      material.transparent = true;
      material.depthWrite = false;
      material.side = DoubleSide;
      if (isNearWhite(material)) {
        material.color.setRGB(0.12, 0.14, 0.16);
      }
      if (material.opacity >= 0.95) {
        material.opacity = 0.22;
      }
      if (typeof material.transmission === "number" && material.transmission === 0) {
        material.transmission = 0.85;
      }
      if (typeof material.ior === "number") {
        material.ior = 1.45;
      }
      break;
    case "red-glass":
      material.metalness = 0;
      material.roughness = 0.08;
      material.envMapIntensity = 1.45;
      material.transparent = true;
      material.depthWrite = false;
      material.side = DoubleSide;
      if (material.opacity >= 0.95) {
        material.opacity = 0.42;
      }
      if (isNearWhite(material)) {
        material.color.setRGB(0.38, 0.02, 0.03);
      }
      break;
    case "rim":
    case "chrome":
      material.metalness = Math.max(material.metalness, 0.82);
      material.roughness = 0.14;
      material.envMapIntensity = 1.35;
      break;
    case "mirror":
      material.metalness = Math.max(material.metalness, 0.9);
      material.roughness = Math.min(Math.max(material.roughness, 0.04), 0.18);
      material.envMapIntensity = 1.5;
      break;
    case "rotor":
      material.metalness = Math.max(material.metalness, 0.55);
      material.roughness = Math.min(material.roughness, 0.38);
      material.envMapIntensity = 1.2;
      break;
    case "caliper":
      material.metalness = 0.48;
      material.roughness = 0.32;
      material.envMapIntensity = 1.15;
      break;
    case "tire":
      // Authored metallicFactor 0.75 is not appropriate for rubber.
      if (!material.metalnessMap) {
        material.metalness = 0.04;
      } else {
        material.metalness = 0.08;
      }
      material.envMapIntensity = 0.55;
      break;
    case "trim":
      material.metalness = 0.12;
      material.roughness = 0.22;
      material.envMapIntensity = 0.9;
      break;
    case "leather":
      material.metalness = Math.min(material.metalness, 0.08);
      material.roughness = Math.max(material.roughness, 0.55);
      material.envMapIntensity = 0.45;
      break;
    case "lamp":
      if (typeof material.emissiveIntensity === "number") {
        material.emissiveIntensity = Math.max(material.emissiveIntensity, 1.25);
      }
      break;
    case "logo":
      material.envMapIntensity = 1.1;
      break;
    case "other":
      break;
  }
}

function isNearWhite(material: StandardLike) {
  return material.color.r > 0.9 && material.color.g > 0.9 && material.color.b > 0.9;
}

function isStandardLike(material: Material): material is StandardLike {
  return (
    "metalness" in material &&
    "roughness" in material &&
    "envMapIntensity" in material &&
    "color" in material
  );
}

function isMesh(object: Object3D): object is Mesh {
  return (object as Mesh).isMesh === true;
}

type MaterialRole =
  | "paint"
  | "glass"
  | "red-glass"
  | "rim"
  | "chrome"
  | "mirror"
  | "rotor"
  | "caliper"
  | "tire"
  | "trim"
  | "leather"
  | "lamp"
  | "logo"
  | "other";
