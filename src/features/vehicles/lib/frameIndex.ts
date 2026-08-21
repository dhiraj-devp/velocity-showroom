export const DEFAULT_360_SENSITIVITY = 14;

export function getFrameIndex({
  currentIndex,
  dragDelta,
  frameCount,
  sensitivity = DEFAULT_360_SENSITIVITY,
}: {
  currentIndex: number;
  dragDelta: number;
  frameCount: number;
  sensitivity?: number;
}) {
  if (frameCount <= 0) return 0;
  const step = Math.max(1, sensitivity);
  const steps = Math.round(dragDelta / step);
  return ((currentIndex - steps) % frameCount + frameCount) % frameCount;
}

export function wrapFrameIndex(index: number, frameCount: number) {
  if (frameCount <= 0) return 0;
  return ((index % frameCount) + frameCount) % frameCount;
}
