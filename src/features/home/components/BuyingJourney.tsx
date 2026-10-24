import { MagneticButton } from "@/components/common/MagneticButton";
import { SectionHeading } from "@/components/common/SectionHeading";
import { MotionReveal } from "@/features/home/motion/MotionReveal";
import { CallAction } from "@/features/dealership/components/CallAction";
import { WhatsAppAction } from "@/features/dealership/components/WhatsAppAction";
import type { Dealership } from "@/features/dealership/types";

const steps = [
  {
    title: "Discover",
    description: "Explore the collection. Filter by brand, category, and price.",
    href: "/cars",
    action: "Browse vehicles",
    variant: "left" as const,
  },
  {
    title: "Connect",
    description: "Speak with the dealership about the machine that holds your attention.",
    href: "/#about",
    action: "Contact the desk",
    variant: "up" as const,
  },
  {
    title: "Experience",
    description: "Book a private viewing when you are ready to see it in person.",
    href: "/cars",
    action: "Choose a vehicle",
    variant: "right" as const,
  },
] as const;

type BuyingJourneyProps = {
  dealership: Dealership;
};

export function BuyingJourney({ dealership }: BuyingJourneyProps) {
  return (
    <section
      id="experience"
      aria-labelledby="journey-heading"
      className="overflow-x-hidden px-5 py-20 md:px-10 md:py-28 lg:px-14"
    >
      <MotionReveal variant="up">
        <SectionHeading
          eyebrow="The path"
          title={<span id="journey-heading">A simple journey.</span>}
          description="Discover, speak with the house, then see the machine in person."
        />
      </MotionReveal>

      <ol className="mt-16 grid gap-0 lg:grid-cols-3">
        {steps.map((step, index) => (
          <MotionReveal
            key={step.title}
            as="li"
            variant={step.variant}
            delay={index * 80}
            className="border-t border-border py-10 lg:border-t-0 lg:border-l lg:px-10 lg:py-4 lg:first:border-l-0 lg:first:pl-0"
          >
            <h3 className="font-display text-4xl tracking-[-0.04em] sm:text-5xl">
              {step.title}
            </h3>
            <p className="mt-6 max-w-sm text-base leading-relaxed text-muted">
              {step.description}
            </p>
            <div className="mt-8">
              <MagneticButton href={step.href} variant="secondary">
                {step.action}
              </MagneticButton>
            </div>
          </MotionReveal>
        ))}
      </ol>

      <div className="mt-12 flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-border pt-8">
        <WhatsAppAction
          dealership={dealership}
          message={`Hello, I would like to speak with ${dealership.name} about the collection.`}
        />
        <CallAction dealership={dealership} />
        <a
          href={`mailto:${dealership.email}`}
          className="text-[0.62rem] tracking-[0.22em] text-muted uppercase transition-colors hover:text-foreground"
        >
          {dealership.email}
        </a>
      </div>
    </section>
  );
}
