"use client";

import { useState } from "react";
import { PRICE_PRESETS } from "@/features/vehicles/lib/pricePresets";
import { MotionReveal } from "@/features/home/motion/MotionReveal";
import type { VehicleSearchOptions } from "@/features/vehicles/types";

type HomepageSearchProps = {
  options: VehicleSearchOptions;
};

export function HomepageSearch({ options }: HomepageSearchProps) {
  const [brandSlug, setBrandSlug] = useState("");

  return (
    <section
      id="discover"
      aria-labelledby="home-search-heading"
      className="overflow-x-hidden border-t border-border px-5 py-16 md:px-10 md:py-20 lg:px-14"
    >
      <MotionReveal variant="up">
        <p className="text-[0.7rem] tracking-[0.42em] text-accent uppercase">
          Find a machine
        </p>
        <h2
          id="home-search-heading"
          className="font-display mt-5 text-[clamp(2rem,5vw,3.4rem)] tracking-[-0.03em]"
        >
          Search the collection.
        </h2>
      </MotionReveal>

      <MotionReveal variant="up" delay={80}>
        <form action="/cars" method="get" className="home-search mt-10">
          <label className="collection-field home-search-query">
            <span className="collection-label">Search</span>
            <input
              type="search"
              name="q"
              className="collection-input"
              placeholder="Vehicles, brands, or models"
              autoComplete="off"
            />
          </label>

          <label className="collection-field">
            <span className="collection-label">Brand</span>
            <select
              name="brand"
              className="collection-select"
              value={brandSlug}
              onChange={(event) => setBrandSlug(event.target.value)}
            >
              <option value="">All brands</option>
              {options.brands.map((brand) => (
                <option key={brand.id} value={brand.slug}>
                  {brand.name}
                </option>
              ))}
            </select>
          </label>

          <label className="collection-field">
            <span className="collection-label">Category</span>
            <select name="category" className="collection-select" defaultValue="">
              <option value="">All categories</option>
              {options.categories.map((category) => (
                <option key={category.id} value={category.slug}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>

          <label className="collection-field">
            <span className="collection-label">Price</span>
            <select name="price" className="collection-select" defaultValue="any">
              {PRICE_PRESETS.map((preset) => (
                <option key={preset.id} value={preset.id}>
                  {preset.label}
                </option>
              ))}
            </select>
          </label>

          <button type="submit" className="collection-apply home-search-submit">
            Search
          </button>
        </form>
      </MotionReveal>
    </section>
  );
}
