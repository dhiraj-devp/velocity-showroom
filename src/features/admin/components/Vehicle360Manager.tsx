"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ActionForm } from "@/features/admin/components/ActionForm";
import {
  delete360FrameAction,
  move360FrameAction,
  set360EnabledAction,
  upload360FrameAction,
} from "@/features/admin/actions/vehicles";
import { MIN_360_FRAMES } from "@/features/vehicles/lib/spin";
import { Vehicle360Preview } from "@/features/vehicles/components/Vehicle360Preview";
import type { Vehicle360Frame } from "@/features/vehicles/types";

export function Vehicle360Manager({
  vehicleId,
  vehicleName,
  frames,
  enabled,
}: {
  vehicleId: string;
  vehicleName: string;
  frames: Vehicle360Frame[];
  enabled: boolean;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const ordered = [...frames].sort((a, b) => a.sortOrder - b.sortOrder);
  const canEnable = ordered.length >= MIN_360_FRAMES;

  return (
    <section className="admin-section">
      <h2>360° experience</h2>
      <p className="text-sm text-muted">
        Upload a sequence of images captured around the vehicle.
      </p>
      <p className="mt-3 text-[0.58rem] tracking-[0.2em] text-muted uppercase">
        {ordered.length} frames · {MIN_360_FRAMES} required to enable
      </p>

      <form
        className="mt-6"
        onSubmit={async (event) => {
          event.preventDefault();
          const form = event.currentTarget;
          const input = form.elements.namedItem("image") as HTMLInputElement;
          const files = [...(input.files ?? [])];
          if (files.length === 0) {
            setError("Choose at least one frame.");
            return;
          }
          setError(null);
          for (const [index, file] of files.entries()) {
            setStatus(`Uploading ${index + 1} of ${files.length}`);
            const data = new FormData();
            data.set("vehicleId", vehicleId);
            data.set("image", file);
            const result = await upload360FrameAction(data);
            if (!result.ok) {
              setError(result.error);
              setStatus(null);
              return;
            }
          }
          input.value = "";
          setStatus("Frames added.");
          router.refresh();
        }}
      >
        <label className="collection-field">
          <span className="collection-label">Upload sequence (JPG, PNG, WebP)</span>
          <input
            className="collection-input"
            type="file"
            name="image"
            accept="image/jpeg,image/png,image/webp"
            multiple
            required
          />
        </label>
        <button type="submit" className="collection-apply mt-4">
          Upload frames
        </button>
      </form>
      {status ? <p className="mt-3 text-sm text-muted">{status}</p> : null}
      {error ? (
        <p className="mt-3 text-sm text-accent" role="alert">
          {error}
        </p>
      ) : null}

      {canEnable || enabled ? (
        <ActionForm
          action={set360EnabledAction}
          className="mt-6"
          success={enabled ? "360° disabled." : "360° enabled."}
        >
          <input type="hidden" name="vehicleId" value={vehicleId} />
          <input type="hidden" name="enabled" value={enabled ? "false" : "true"} />
          <button type="submit" className="collection-apply">
            {enabled ? "Disable 360° view" : "Enable 360° view"}
          </button>
        </ActionForm>
      ) : (
        <p className="mt-6 text-sm text-accent">
          Upload at least {MIN_360_FRAMES} frames before 360° can be enabled.
        </p>
      )}
      {enabled && !canEnable ? (
        <p className="mt-3 text-sm text-accent">
          360° is flagged on but fewer than {MIN_360_FRAMES} frames exist, so it stays hidden on the public page.
        </p>
      ) : null}
      {enabled ? (
        <p className="mt-3 text-[0.58rem] tracking-[0.2em] text-accent uppercase">
          Live on the public page
        </p>
      ) : null}

      {ordered.length > 0 ? (
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {ordered.map((frame, index) => (
            <li key={frame.id} className="border border-border p-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={frame.src} alt="" className="aspect-square w-full object-cover bg-surface" />
              <p className="mt-2 text-[0.58rem] tracking-[0.2em] text-muted uppercase">
                Frame {index + 1}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {index > 0 ? (
                  <ActionForm action={move360FrameAction}>
                    <input type="hidden" name="vehicleId" value={vehicleId} />
                    <input
                      type="hidden"
                      name="orderedIds"
                      value={swap(ordered, index, index - 1)
                        .map((item) => item.id)
                        .join(",")}
                    />
                    <button type="submit" className="admin-ghost">
                      Up
                    </button>
                  </ActionForm>
                ) : null}
                {index < ordered.length - 1 ? (
                  <ActionForm action={move360FrameAction}>
                    <input type="hidden" name="vehicleId" value={vehicleId} />
                    <input
                      type="hidden"
                      name="orderedIds"
                      value={swap(ordered, index, index + 1)
                        .map((item) => item.id)
                        .join(",")}
                    />
                    <button type="submit" className="admin-ghost">
                      Down
                    </button>
                  </ActionForm>
                ) : null}
                <ActionForm action={delete360FrameAction}>
                  <input type="hidden" name="vehicleId" value={vehicleId} />
                  <input type="hidden" name="frameId" value={frame.id} />
                  <button type="submit" className="admin-ghost">
                    Delete
                  </button>
                </ActionForm>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-6 text-sm text-muted">No 360 frames yet.</p>
      )}

      {ordered.length > 0 ? (
        <Vehicle360Preview name={vehicleName} frames={ordered} />
      ) : null}
    </section>
  );
}

function swap(frames: Vehicle360Frame[], from: number, to: number) {
  const next = [...frames];
  const item = next[from];
  next[from] = next[to];
  next[to] = item;
  return next;
}
