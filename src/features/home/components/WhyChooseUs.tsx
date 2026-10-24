import { SectionHeading } from "@/components/common/SectionHeading";
import { MotionReveal } from "@/features/home/motion/MotionReveal";

const reasons = [
  {
    title: "Curated inventory",
    description:
      "A considered list rather than a crowded lot. Each machine is presented with the space it deserves.",
    variant: "left" as const,
  },
  {
    title: "Verified selection",
    description:
      "Details are maintained by the desk — specification, availability, and photography kept current.",
    variant: "up" as const,
  },
  {
    title: "Private viewings",
    description:
      "Arrange a quiet appointment to see a vehicle in person, without a showroom floor of distractions.",
    variant: "down" as const,
  },
  {
    title: "Personal assistance",
    description:
      "Speak directly with the dealership. Enquiries, viewings, and follow-up stay with the same desk.",
    variant: "right" as const,
  },
] as const;

export function WhyChooseUs() {
  return (
    <section
      id="why"
      aria-labelledby="why-heading"
      className="overflow-x-hidden border-t border-border px-5 py-20 md:px-10 md:py-28 lg:px-14"
    >
      <MotionReveal variant="up">
        <SectionHeading
          eyebrow="The house"
          title={<span id="why-heading">Why collect here.</span>}
          description="A quieter way to discover the next machine — composed, private, and attended."
        />
      </MotionReveal>

      <ul className="mt-16 grid gap-0 sm:grid-cols-2 lg:grid-cols-4">
        {reasons.map((item, index) => (
          <MotionReveal
            key={item.title}
            as="li"
            variant={item.variant}
            delay={index * 70}
            className="border-t border-border py-10 sm:border-t-0 sm:border-l sm:px-8 sm:py-4 sm:first:border-l-0 sm:first:pl-0"
          >
            <h3 className="font-display text-2xl tracking-[-0.03em] sm:text-3xl">
              {item.title}
            </h3>
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-muted">
              {item.description}
            </p>
          </MotionReveal>
        ))}
      </ul>
    </section>
  );
}
