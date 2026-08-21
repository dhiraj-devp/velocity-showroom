import { MagneticButton } from "@/components/common/MagneticButton";

export function CtaSection() {
  return (
    <section
      aria-labelledby="cta-heading"
      className="relative isolate overflow-hidden border-t border-border px-5 py-28 md:px-10 md:py-36 lg:px-14 lg:py-44"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(198,165,106,0.14),transparent_58%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/50 to-transparent"
      />

      <div className="relative mx-auto flex max-w-5xl flex-col items-center text-center">
        <h2
          id="cta-heading"
          className="font-display text-[clamp(2.6rem,8vw,6.5rem)] leading-[0.9] font-semibold tracking-[-0.04em] text-balance"
        >
          YOUR NEXT DRIVE
          <br />
          STARTS HERE.
        </h2>
        <div className="mt-12">
          <MagneticButton href="/#showroom">Explore the Showroom</MagneticButton>
        </div>
      </div>
    </section>
  );
}
