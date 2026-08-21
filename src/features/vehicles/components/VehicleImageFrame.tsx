import type { VehicleImage } from "@/features/vehicles/types";
import { isStoredVehiclePhoto } from "@/features/vehicles/lib/vehicleImages";
import { cn } from "@/lib/cn";

const TONES: Record<string, string> = {
  bmw: "#152238",
  porsche: "#2a2118",
  mercedes: "#161816",
  audi: "#1b2228",
  lamborghini: "#2c1d10",
  ferrari: "#2a1414",
};

type VehicleImageFrameProps = {
  image?: VehicleImage;
  brandId: string;
  brandName: string;
  vehicleName: string;
  className?: string;
  priority?: boolean;
};

export function VehicleImageFrame({
  image,
  brandId,
  brandName,
  vehicleName,
  className,
  priority,
}: VehicleImageFrameProps) {
  const tone = TONES[brandId] ?? "#161618";
  const photo = image && isStoredVehiclePhoto(image.src) ? image : undefined;

  return (
    <div
      className={cn("vehicle-media relative overflow-hidden bg-surface", className)}
      style={{ backgroundColor: tone }}
    >
      {photo ? (
        // eslint-disable-next-line @next/next/no-img-element -- local /uploads files, not remote next/image hosts
        <img
          src={photo.src}
          alt=""
          width={photo.width}
          height={photo.height}
          className="absolute inset-0 h-full w-full object-cover"
          fetchPriority={priority ? "high" : undefined}
        />
      ) : null}
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-80"
        style={{
          background: `radial-gradient(ellipse 70% 55% at 70% 20%, rgba(198,165,106,0.18), transparent 58%),
            linear-gradient(180deg, transparent 35%, rgba(5,5,6,0.72) 100%)`,
        }}
      />
      <div
        aria-hidden="true"
        className="vehicle-media-grid absolute inset-x-0 bottom-0 h-[58%] opacity-40"
      />
      <p className="relative z-10 px-5 pt-5 text-[0.58rem] tracking-[0.32em] text-accent uppercase">
        {brandName}
      </p>
      <div className="relative z-10 flex h-full items-end px-5 pb-5">
        <p className="font-display text-2xl tracking-[-0.03em] text-foreground/90 sm:text-3xl">
          {vehicleName}
        </p>
      </div>
      {image ? (
        <span className="sr-only">{image.alt}</span>
      ) : null}
    </div>
  );
}
