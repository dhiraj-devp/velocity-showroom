import Link from "next/link";
import { SectionHeading } from "@/components/common/SectionHeading";
import { categoryLine } from "@/features/home/components/CategoryIcon";
import { MotionReveal } from "@/features/home/motion/MotionReveal";
import type { HomepageCategory } from "@/features/vehicles/types";

type CategoryBrowseProps = {
  categories: HomepageCategory[];
};

export function CategoryBrowse({ categories }: CategoryBrowseProps) {
  if (categories.length === 0) return null;

  return (
    <section
      id="categories"
      aria-labelledby="categories-heading"
      className="border-t border-border px-5 py-20 md:px-10 md:py-28 lg:px-14"
    >
      <MotionReveal variant="up">
        <SectionHeading
          eyebrow="Browse"
          title={<span id="categories-heading">By category.</span>}
          description="Every category is drawn from the live catalogue. New ones appear here as the desk adds them."
        />
      </MotionReveal>

      <ul className="mt-14 border-t border-border">
        {categories.map((category, index) => (
          <MotionReveal
            key={category.id}
            as="li"
            variant="up"
            delay={Math.min(index, 5) * 50}
          >
            <Link
              href={`/cars?category=${category.slug}`}
              className="group grid grid-cols-[1fr_auto] items-end gap-6 border-b border-border py-7 transition-colors duration-300 hover:bg-surface/60 sm:grid-cols-[minmax(0,0.7fr)_minmax(0,1fr)_auto] sm:py-9 md:px-2"
            >
              <h3 className="font-display text-[clamp(2.2rem,5vw,4.25rem)] leading-none tracking-[-0.045em]">
                {category.name}
              </h3>
              <p className="hidden max-w-sm text-sm leading-relaxed text-muted sm:block">
                {categoryLine(category.slug)}
              </p>
              <span className="mb-1 text-[0.62rem] tracking-[0.28em] text-accent uppercase transition-transform duration-300 group-hover:translate-x-1">
                View
              </span>
              <p className="col-span-2 text-sm leading-relaxed text-muted sm:hidden">
                {categoryLine(category.slug)}
              </p>
            </Link>
          </MotionReveal>
        ))}
      </ul>
    </section>
  );
}
