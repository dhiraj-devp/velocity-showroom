import { MagneticButton } from "@/components/common/MagneticButton";
import { HeroCar } from "@/features/home/components/HeroCar";
import { getHeroImage } from "@/features/vehicles/lib/resolveVehicle";
import type { VehicleRecord } from "@/features/vehicles/types";

type HeroSectionProps = {
  showcase?: VehicleRecord | null;
};

export function HeroSection({ showcase = null }: HeroSectionProps) {
  const image = showcase ? getHeroImage(showcase) : undefined;
  const name = showcase
    ? `${showcase.brand.name} ${showcase.vehicle.name}`
    : undefined;

  return (
    <section
      aria-labelledby="hero-heading"
      className="hero-atmosphere relative isolate flex min-h-dvh overflow-hidden"
    >
      <div
        aria-hidden="true"
        className="hero-floor pointer-events-none absolute inset-x-0 bottom-[-18%] h-[58%] opacity-70"
      >
        <div className="hero-grid h-full w-full" />
      </div>

      <div
        aria-hidden="true"
        className="hero-beam pointer-events-none absolute top-[38%] left-1/2 h-px w-[min(90%,72rem)] -translate-x-1/2"
      />

      <HeroCar image={image} name={name} />

      <div aria-hidden="true" className="hero-copy-veil sm:hidden" />

      <div className="hero-copy relative z-10 mx-auto flex w-full max-w-[92rem] flex-col justify-end px-5 pt-28 pb-16 md:px-10 md:pb-20 lg:px-14 lg:pb-24">
        <p className="hero-line hero-line-1 mb-6 text-[0.65rem] tracking-[0.42em] text-accent uppercase sm:mb-8 sm:text-[0.7rem]">
          Atelier
        </p>

        <h1
          id="hero-heading"
          className="hero-line hero-line-2 font-display max-w-[12ch] text-[clamp(2.6rem,11vw,9.5rem)] leading-[0.86] font-semibold tracking-[-0.045em] text-balance"
        >
          THE FUTURE
          <br />
          OF DRIVING
        </h1>

        <div className="hero-line hero-line-3 mt-8 flex max-w-3xl flex-col gap-8 lg:mt-14 lg:flex-row lg:items-end lg:justify-between">
          <p className="max-w-md text-sm leading-relaxed text-muted sm:text-base lg:text-lg">
            Step inside a new generation of automotive experiences.
          </p>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <MagneticButton href="/#showroom">Enter Showroom</MagneticButton>
            <MagneticButton href="/cars" variant="secondary">
              Explore Collection
            </MagneticButton>
          </div>
        </div>
      </div>
    </section>
  );
}
