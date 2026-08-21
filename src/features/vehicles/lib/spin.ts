export const MIN_360_FRAMES = 8;

export function is360ExperienceReady(enabled: boolean, frameCount: number) {
  return enabled && frameCount >= MIN_360_FRAMES;
}
