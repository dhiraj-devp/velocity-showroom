"use client";

import { useState } from "react";
import { VehicleImageFrame } from "@/features/vehicles/components/VehicleImageFrame";
import type { VehicleRecord } from "@/features/vehicles/types";

export function VehicleGallery({ record }: { record: VehicleRecord }) {
  const images = record.vehicle.images;
  const [index, setIndex] = useState(0);
  const current = images[index] ?? images[0];

  return (
    <div>
      <VehicleImageFrame
        image={current}
        brandId={record.brand.id}
        brandName={record.brand.name}
        vehicleName={record.vehicle.name}
        className="aspect-[16/9] min-h-72"
        priority
      />
      {record.vehicle.hasGallery && images.length > 1 ? (
        <ul className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-4">
          {images.map((image, imageIndex) => (
            <li key={image.id}>
              <button
                type="button"
                className="w-full border border-border"
                aria-pressed={imageIndex === index}
                onClick={() => setIndex(imageIndex)}
              >
                <VehicleImageFrame
                  image={image}
                  brandId={record.brand.id}
                  brandName={record.brand.name}
                  vehicleName={`${record.vehicle.name} ${imageIndex + 1}`}
                  className="aspect-[16/10]"
                />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
