"use client";

import { Vehicle360Viewer } from "@/features/vehicles/components/Vehicle360Viewer";
import type { Vehicle360Frame } from "@/features/vehicles/types";

export function Vehicle360Preview({
  name,
  frames,
}: {
  name: string;
  frames: Vehicle360Frame[];
}) {
  if (frames.length === 0) return null;

  return (
    <div className="mt-8 border border-border p-4">
      <p className="text-[0.58rem] tracking-[0.24em] text-muted uppercase">Preview</p>
      <Vehicle360Viewer name={name} frames={frames} compact className="mt-3" />
    </div>
  );
}
