import { SectionHeading } from "@/components/common/SectionHeading";

const experienceItems = [
  {
    title: "EXPLORE",
    description:
      "Interactive 3D exploration. Orbit every surface. Read every line of the body as if the machine were in the room.",
  },
  {
    title: "INTERACT",
    description:
      "Detailed vehicle discovery. Specs, materials, and presence — composed so you understand the car before you ever sit in it.",
  },
  {
    title: "EXPERIENCE",
    description:
      "Immersive showroom navigation. Move through light, space, and silence until the next machine feels inevitable.",
  },
] as const;

export function ExperienceSection() {
  return (
    <section
      id="experience"
      aria-labelledby="experience-heading"
      className="px-5 py-24 md:px-10 md:py-32 lg:px-14 lg:py-40"
    >
      <SectionHeading
        eyebrow="The Ritual"
        title={<span id="experience-heading">How it will feel.</span>}
      />

      <ol className="mt-16 grid gap-0 lg:mt-20 lg:grid-cols-3">
        {experienceItems.map((item) => (
          <li
            key={item.title}
            className="border-t border-border py-10 lg:border-t-0 lg:border-l lg:px-10 lg:py-4 lg:first:border-l-0 lg:first:pl-0"
          >
            <h3 className="font-display text-4xl tracking-[-0.04em] sm:text-5xl">
              {item.title}
            </h3>
            <p className="mt-6 max-w-sm text-base leading-relaxed text-muted">
              {item.description}
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
}
