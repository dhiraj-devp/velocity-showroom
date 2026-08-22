let progress = 0;

export function setShowroomScrollProgress(value: number) {
  const next = value < 0 ? 0 : value > 1 ? 1 : value;
  if (next === progress) return;
  progress = next;
}

export function getShowroomScrollProgress() {
  return progress;
}
