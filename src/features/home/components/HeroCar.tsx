import { isStoredVehiclePhoto } from "@/features/vehicles/lib/vehicleImages";
import type { VehicleImage } from "@/features/vehicles/types";

type HeroCarProps = {
  image?: VehicleImage;
  name?: string;
};

export function HeroCar({ image, name }: HeroCarProps) {
  const photo = image && isStoredVehiclePhoto(image.src) ? image : undefined;

  return (
    <div className="hero-car-stage" aria-hidden="true">
      <div className="hero-car-layer hero-car-glow" />
      <div className="hero-car-layer hero-car-body">
        {photo ? (
          // eslint-disable-next-line @next/next/no-img-element -- local /uploads files
          <img
            src={photo.src}
            alt=""
            width={photo.width}
            height={photo.height}
            className="hero-car-photo"
            fetchPriority="high"
            decoding="async"
          />
        ) : (
          <HeroCarSilhouette />
        )}
      </div>
      {name ? <span className="sr-only">{name}</span> : null}
    </div>
  );
}

function HeroCarSilhouette() {
  return (
    <svg
      className="hero-car-silhouette"
      viewBox="0 0 640 220"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M72 148c18-6 46-38 78-46 28-8 62-8 108-14 54-8 96-28 148-32 46-4 88 8 128 18 32 8 70 12 94 28 8 6 12 16 10 28-38 8-74 4-112 10-18-22-48-36-82-36s-64 14-82 36c-36-2-88 2-140 8-18-20-46-32-76-32-32 0-62 14-80 36-12 2-24 4-32 6 0-4 4-8 8-10z"
        fill="url(#heroCarBody)"
      />
      <circle cx="198" cy="164" r="34" stroke="#c6a56a" strokeWidth="3" fill="#0b0b0d" />
      <circle cx="198" cy="164" r="14" fill="#2a2a2e" stroke="#c6a56a" strokeWidth="1.5" />
      <circle cx="454" cy="164" r="34" stroke="#c6a56a" strokeWidth="3" fill="#0b0b0d" />
      <circle cx="454" cy="164" r="14" fill="#2a2a2e" stroke="#c6a56a" strokeWidth="1.5" />
      <path
        d="M168 112c28-4 70-22 126-26 48-4 86 10 122 18"
        stroke="#e8d7b0"
        strokeWidth="1.2"
        opacity="0.45"
      />
      <defs>
        <linearGradient id="heroCarBody" x1="72" y1="80" x2="620" y2="180">
          <stop stopColor="#3a3d45" />
          <stop offset="0.5" stopColor="#1c1d22" />
          <stop offset="1" stopColor="#c6a56a" stopOpacity="0.55" />
        </linearGradient>
      </defs>
    </svg>
  );
}
