import Link from "next/link";
import type { VehicleRecord } from "@/features/vehicles/types";

export function VehicleExperienceCta({ record }: { record: VehicleRecord }) {
  const { vehicle } = record;

  if (!vehicle.has360View && !vehicle.has3DExperience) return null;

  return (
    <div className="mt-10 grid gap-3 sm:grid-cols-2">
      {vehicle.has360View ? (
        <div className="border border-border px-5 py-6">
          <p className="text-[0.58rem] tracking-[0.32em] text-accent uppercase">
            360° view
          </p>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            A spin sequence will appear here when photography is complete.
          </p>
          <p className="mt-5 text-[0.62rem] tracking-[0.24em] text-muted uppercase">
            Viewer reserved
          </p>
        </div>
      ) : null}
      {vehicle.has3DExperience ? (
        <div className="border border-border px-5 py-6">
          <p className="text-[0.58rem] tracking-[0.32em] text-accent uppercase">
            Immersive
          </p>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            Step into the cinematic showroom for this machine.
          </p>
          <Link
            href="/#showroom"
            className="mt-5 inline-flex min-h-11 items-center text-[0.62rem] tracking-[0.28em] text-accent uppercase"
          >
            Enter 3D experience →
          </Link>
        </div>
      ) : null}
    </div>
  );
}
