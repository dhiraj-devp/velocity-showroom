"use client";

import {
  deleteVehicleImageAction,
  moveVehicleImageAction,
  setCoverImageAction,
  uploadVehicleImageAction,
} from "@/features/admin/actions/vehicles";
import type { VehicleImage } from "@/features/vehicles/types";
import { ActionForm } from "@/features/admin/components/ActionForm";

export function VehicleImageManager({
  vehicleId,
  images,
}: {
  vehicleId: string;
  images: VehicleImage[];
}) {
  const ordered = [...images];

  return (
    <section className="admin-section">
      <h2>Vehicle gallery</h2>
      <ActionForm action={uploadVehicleImageAction} success="Image added.">
        <input type="hidden" name="vehicleId" value={vehicleId} />
        <label className="collection-field">
          <span className="collection-label">Upload JPG, PNG, or WebP</span>
          <input className="collection-input" type="file" name="image" accept="image/jpeg,image/png,image/webp" required />
        </label>
        <label className="collection-field mt-3">
          <span className="collection-label">Alt text</span>
          <input className="collection-input" name="alt" />
        </label>
        <label className="mt-3 flex items-center gap-3 text-sm">
          <input type="checkbox" name="isPrimary" />
          Set as cover
        </label>
        <button type="submit" className="collection-apply mt-4">
          Upload
        </button>
      </ActionForm>

      {ordered.length > 0 ? (
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ordered.map((image, index) => (
            <li key={image.id} className="border border-border p-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={image.src} alt={image.alt} className="aspect-[16/10] w-full object-cover bg-surface" />
              <p className="mt-2 text-[0.58rem] tracking-[0.2em] text-muted uppercase">
                {image.role === "hero" ? "Cover" : `Image ${index + 1}`}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {image.role !== "hero" ? (
                  <ActionForm action={setCoverImageAction}>
                    <input type="hidden" name="vehicleId" value={vehicleId} />
                    <input type="hidden" name="imageId" value={image.id} />
                    <button type="submit" className="admin-ghost">
                      Cover
                    </button>
                  </ActionForm>
                ) : null}
                {index > 0 ? (
                  <ActionForm action={moveVehicleImageAction}>
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
                  <ActionForm action={moveVehicleImageAction}>
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
                <ActionForm action={deleteVehicleImageAction}>
                  <input type="hidden" name="vehicleId" value={vehicleId} />
                  <input type="hidden" name="imageId" value={image.id} />
                  <button type="submit" className="admin-ghost">
                    Delete
                  </button>
                </ActionForm>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-6 text-sm text-muted">No photography yet.</p>
      )}
    </section>
  );
}

function swap(images: VehicleImage[], from: number, to: number) {
  const next = [...images];
  const item = next[from];
  next[from] = next[to];
  next[to] = item;
  return next;
}
