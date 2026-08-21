import { MagneticButton } from "@/components/common/MagneticButton";

export function HeroSection() {
  return (
    <section
      aria-labelledby="hero-heading"
      className="hero-atmosphere relative isolate flex min-h-dvh overflow-hidden"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-[-18%] h-[58%] opacity-80"
      >
        <div className="hero-grid h-full w-full" />
      </div>

      <div
        aria-hidden="true"
        className="hero-beam pointer-events-none absolute top-[38%] left-1/2 h-px w-[min(90%,72rem)] -translate-x-1/2"
      />

      <div
        aria-hidden="true"
        className="halo pointer-events-none absolute bottom-[12%] left-1/2 h-40 w-[min(70%,40rem)] -translate-x-1/2 rounded-[100%] bg-accent/20 blur-3xl"
      />

      <div className="relative z-10 mx-auto flex w-full max-w-[92rem] flex-col justify-end px-5 pt-32 pb-16 md:px-10 md:pb-20 lg:px-14 lg:pb-24">
        <p className="mb-8 text-[0.7rem] tracking-[0.42em] text-accent uppercase">
          Atelier · Collection 01
        </p>

        <h1
          id="hero-heading"
          className="font-display max-w-[14ch] text-[clamp(3.4rem,12vw,9.5rem)] leading-[0.86] font-semibold tracking-[-0.045em] text-balance"
        >
          THE FUTURE
          <br />
          OF DRIVING
        </h1>

        <div className="mt-10 flex max-w-3xl flex-col gap-10 lg:mt-14 lg:flex-row lg:items-end lg:justify-between">
          <p className="max-w-md text-base leading-relaxed text-muted sm:text-lg">
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
