"use client";

import { useEffect, useId, useRef } from "react";
import { Vehicle360Viewer } from "@/features/vehicles/components/Vehicle360Viewer";
import type { Vehicle360Frame } from "@/features/vehicles/types";

export function Vehicle360Dialog({
  name,
  frames,
  onClose,
}: {
  name: string;
  frames: Vehicle360Frame[];
  onClose: () => void;
}) {
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    previousFocus.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    closeRef.current?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
      if (event.key !== "Tab" || !dialogRef.current) return;
      const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
      previousFocus.current?.focus();
    };
  }, [onClose]);

  return (
    <div
      ref={dialogRef}
      className="vehicle-360-dialog"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <button type="button" className="vehicle-360-backdrop" onClick={onClose} aria-label="Close 360 view" />
      <div className="vehicle-360-stage">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[0.58rem] tracking-[0.32em] text-accent uppercase">360° view</p>
            <h2 id={titleId} className="font-display mt-2 text-2xl tracking-[-0.03em]">
              {name}
            </h2>
          </div>
          <button ref={closeRef} type="button" className="admin-ghost" onClick={onClose}>
            Close
          </button>
        </div>

        {frames.length > 0 ? (
          <Vehicle360Viewer name={name} frames={frames} captureKeys className="mt-6" />
        ) : (
          <p className="mt-8 text-sm text-muted">This spin sequence is not available.</p>
        )}
      </div>
    </div>
  );
}
