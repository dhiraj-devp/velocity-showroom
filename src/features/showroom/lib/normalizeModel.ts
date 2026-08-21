import { Box3, Vector3, type Object3D } from "three";
import { PLATFORM_TOP } from "@/features/showroom/config";

export const CAR_MODEL_PATH = "/models/car.glb";
export const TARGET_VEHICLE_LENGTH = 2.85;

/** Trunk/boot sits at +Z in the source GLB; yaw so the nose faces the camera. */
export const PRESENTATION_YAW = Math.PI;

export { prepareCarMaterials } from "@/features/showroom/lib/prepareCarMaterials";

export type ModelNormalization = {
  innerPosition: [number, number, number];
  outerPosition: [number, number, number];
  rotation: [number, number, number];
  scale: number;
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
};

export function computeModelNormalization(
  object: Object3D,
  options: {
    targetLength?: number;
    groundY?: number;
  } = {},
): ModelNormalization {
  const targetLength = options.targetLength ?? TARGET_VEHICLE_LENGTH;
  const groundY = options.groundY ?? PLATFORM_TOP;

  object.updateWorldMatrix(true, true);

  const box = new Box3().setFromObject(object);
  const size = box.getSize(new Vector3());
  const center = box.getCenter(new Vector3());

  const rotationY = (size.x > size.z ? Math.PI / 2 : 0) + PRESENTATION_YAW;
  const length = Math.max(size.x, size.z);
  const width = Math.min(size.x, size.z);
  const scale = length > 0 ? targetLength / length : 1;
  const scaledHeight = size.y * scale;

  return {
    innerPosition: [-center.x, -center.y, -center.z],
    outerPosition: [0, groundY + scaledHeight / 2, 0],
    rotation: [0, rotationY, 0],
    scale,
    dimensions: {
      length: length * scale,
      width: width * scale,
      height: scaledHeight,
    },
  };
}
