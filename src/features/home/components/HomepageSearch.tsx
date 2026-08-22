"use client";

import { useMemo, useState } from "react";
import { PRICE_PRESETS } from "@/features/vehicles/lib/pricePresets";
import { availabilityLabel } from "@/features/vehicles/lib/availability";
import type {
  VehicleAvailability,
  VehicleSearchOptions,
} from "@/features/vehicles/types";

const AVAILABILITIES: VehicleAvailability[] = [
  "available",
  "reserved",
  "coming_soon",
];

type HomepageSearchProps = {
  options: VehicleSearchOptions;
};

export function HomepageSearch({ options }: HomepageSearchProps) {
  const [brandSlug, setBrandSlug] = useState("");
  const selectedBrand = options.brands.find((brand) => brand.slug === brandSlug);
  const models = useMemo(() => {
    if (!selectedBrand) return options.models;
    return options.models.filter((model) => model.brandId === selectedBrand.id);
  }, [options.models, selectedBrand]);

  return (
    <section
      id="discover"
      aria-labelledby="home-search-heading"
      className="home-reveal border-t border-border px-5 py-16 md:px-10 md:py-20 lg:px-14"
    >
      <p className="text-[0.7rem] tracking-[0.42em] text-accent uppercase">
        Find a machine
      </p>
      <h2
        id="home-search-heading"
        className="font-display mt-5 text-4xl tracking-[-0.03em] sm:text-5xl"
      >
        Search the collection.
      </h2>

      <form action="/cars" method="get" className="home-search mt-10">
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
          <span className="collection-label">Model</span>
          <select
            name="model"
            className="collection-select"
            defaultValue=""
            key={brandSlug}
          >
            <option value="">All models</option>
            {models.map((model) => (
              <option key={model.id} value={model.slug}>
                {model.name}
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
          <span className="collection-label">Price range</span>
          <select name="price" className="collection-select" defaultValue="any">
            {PRICE_PRESETS.map((preset) => (
              <option key={preset.id} value={preset.id}>
                {preset.label}
              </option>
            ))}
          </select>
        </label>

        <label className="collection-field">
          <span className="collection-label">Availability</span>
          <select
            name="availability"
            className="collection-select"
            defaultValue=""
          >
            <option value="">Any</option>
            {AVAILABILITIES.map((status) => (
              <option key={status} value={status}>
                {availabilityLabel(status)}
              </option>
            ))}
          </select>
        </label>

        <button type="submit" className="collection-apply home-search-submit">
          Search collection
        </button>
      </form>
    </section>
  );
}
