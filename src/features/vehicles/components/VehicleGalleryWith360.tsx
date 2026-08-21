"use client";

import { trackProductEvent } from "@/features/analytics/lib/track";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";
import { VehicleGallery } from "@/features/vehicles/components/VehicleGallery";
import { MIN_360_FRAMES } from "@/features/vehicles/lib/spin";
import type { VehicleRecord } from "@/features/vehicles/types";

const Vehicle360Dialog = dynamic(
  () =>
    import("@/features/vehicles/components/Vehicle360Dialog").then(
      (module) => module.Vehicle360Dialog,
    ),
  { ssr: false },
);

const HASH = "#view-360";

export function VehicleGalleryWith360({ record }: { record: VehicleRecord }) {
  const [open, setOpen] = useState(false);
  const ready =
    record.vehicle.has360View && record.vehicle.frames.length >= MIN_360_FRAMES;

  const close = useCallback(() => {
    setOpen(false);
    if (window.location.hash === HASH) {
      history.replaceState(null, "", window.location.pathname + window.location.search);
    }
  }, []);

  useEffect(() => {
    function sync() {
      if (window.location.hash === HASH && ready) setOpen(true);
    }
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, [ready]);

  useEffect(() => {
    if (open && ready) {
      trackProductEvent("vehicle_360_opened", {
        vehicleId: record.vehicle.id,
        slug: record.vehicle.slug,
      });
    }
  }, [open, ready, record.vehicle.id, record.vehicle.slug]);

  return (
    <div>
      <div className="relative">
        <VehicleGallery record={record} />
        {ready ? (
          <a
            href={HASH}
            className="absolute right-4 bottom-4 z-10 border border-accent/70 bg-background/80 px-3 py-2 text-[0.58rem] tracking-[0.28em] text-accent uppercase backdrop-blur-sm"
            onClick={(event) => {
              event.preventDefault();
              setOpen(true);
              history.replaceState(null, "", HASH);
            }}
          >
            360° view
          </a>
        ) : null}
      </div>
      {open && ready ? (
        <Vehicle360Dialog
          name={record.vehicle.name}
          frames={record.vehicle.frames}
          onClose={close}
        />
      ) : null}
    </div>
  );
}
