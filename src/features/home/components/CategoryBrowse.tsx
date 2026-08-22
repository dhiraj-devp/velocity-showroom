import Link from "next/link";
import { SectionHeading } from "@/components/common/SectionHeading";
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
      className="home-reveal border-t border-border px-5 py-20 md:px-10 md:py-28 lg:px-14"
    >
      <SectionHeading
        eyebrow="Browse"
        title={<span id="categories-heading">By category.</span>}
        description="Every category is drawn from the live catalogue. New ones appear here as the desk adds them."
      />

      <ul className="mt-14 grid gap-px bg-border sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category, index) => (
          <li key={category.id} className="bg-background">
            <Link
              href={`/cars?category=${category.slug}`}
              className="category-tile group flex min-h-44 flex-col justify-between p-7 sm:min-h-52 sm:p-9"
            >
              <p className="text-[0.62rem] tracking-[0.32em] text-accent uppercase">
                {String(index + 1).padStart(2, "0")}
              </p>
              <div>
                <h3 className="font-display text-3xl tracking-[-0.03em] sm:text-4xl">
                  {category.name}
                </h3>
                <p className="mt-3 text-[0.62rem] tracking-[0.22em] text-muted uppercase">
                  {category.vehicleCount}{" "}
                  {category.vehicleCount === 1 ? "vehicle" : "vehicles"}
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
