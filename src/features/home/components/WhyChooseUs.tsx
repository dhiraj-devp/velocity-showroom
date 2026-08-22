import { SectionHeading } from "@/components/common/SectionHeading";

const reasons = [
  {
    title: "Curated inventory",
    description:
      "A considered list rather than a crowded lot. Each machine is presented with the space it deserves.",
  },
  {
    title: "Verified selection",
    description:
      "Details are maintained by the desk — specification, availability, and photography kept current.",
  },
  {
    title: "Private viewings",
    description:
      "Arrange a quiet appointment to see a vehicle in person, without a showroom floor of distractions.",
  },
  {
    title: "Personal assistance",
    description:
      "Speak directly with the dealership. Enquiries, viewings, and follow-up stay with the same desk.",
  },
] as const;

export function WhyChooseUs() {
  return (
    <section
      id="why"
      aria-labelledby="why-heading"
      className="home-reveal border-t border-border px-5 py-20 md:px-10 md:py-28 lg:px-14"
    >
      <SectionHeading
        eyebrow="The house"
        title={<span id="why-heading">Why collect here.</span>}
        description="A quieter way to discover the next machine — composed, private, and attended."
      />

      <ul className="mt-16 grid gap-0 sm:grid-cols-2 lg:grid-cols-4">
        {reasons.map((item, index) => (
          <li
            key={item.title}
            className="border-t border-border py-10 sm:border-t-0 sm:border-l sm:px-8 sm:py-4 sm:first:border-l-0 sm:first:pl-0"
          >
            <p className="text-[0.65rem] tracking-[0.28em] text-accent uppercase">
              {String(index + 1).padStart(2, "0")}
            </p>
            <h3 className="font-display mt-6 text-2xl tracking-[-0.03em] sm:text-3xl">
              {item.title}
            </h3>
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-muted">
              {item.description}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
