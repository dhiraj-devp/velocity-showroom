"use client";

import { useEffect, useId, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ActiveFilters } from "@/features/vehicles/components/ActiveFilters";
import { VehicleCategoryNav } from "@/features/vehicles/components/VehicleCategoryNav";
import { VehicleEmptyState } from "@/features/vehicles/components/VehicleEmptyState";
import { CompareBar } from "@/features/compare/components/CompareBar";
import { VehicleFiltersPanel } from "@/features/vehicles/components/VehicleFiltersPanel";
import { VehicleGrid } from "@/features/vehicles/components/VehicleGrid";
import { VehicleSearch } from "@/features/vehicles/components/VehicleSearch";
import { VehicleSort } from "@/features/vehicles/components/VehicleSort";
import { clearFilterField, getActiveFilterChips } from "@/features/vehicles/lib/activeFilters";
import { serializeCollectionQuery } from "@/features/vehicles/lib/filterQuery";
import { createDefaultFilters, hasActiveFilters } from "@/features/vehicles/lib/filterState";
import { filterVehicles } from "@/features/vehicles/lib/filterVehicles";
import { resolveVehicles } from "@/features/vehicles/lib/resolveVehicle";
import { sortVehicles } from "@/features/vehicles/lib/sortVehicles";
import type {
  SortOption,
  VehicleCatalog,
  VehicleFilters,
} from "@/features/vehicles/types";

type VehicleCollectionProps = {
  catalog: VehicleCatalog;
  initialFilters: VehicleFilters;
  initialSort: SortOption;
};

export function VehicleCollection({
  catalog,
  initialFilters,
  initialSort,
}: VehicleCollectionProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [filters, setFilters] = useState(initialFilters);
  const [sort, setSort] = useState(initialSort);
  const [sheetOpen, setSheetOpen] = useState(false);
  const sheetId = useId();

  useEffect(() => {
    const query = serializeCollectionQuery({ filters, sort }, catalog);
    const href = query ? `${pathname}?${query}` : pathname;
    router.replace(href, { scroll: false });
  }, [catalog, filters, pathname, router, sort]);

  useEffect(() => {
    if (!sheetOpen) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setSheetOpen(false);
    }

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [sheetOpen]);

  const years = useMemo(() => {
    return [...new Set(catalog.vehicles.map((vehicle) => vehicle.year))].sort(
      (a, b) => b - a,
    );
  }, [catalog.vehicles]);

  const records = useMemo(() => {
    const filtered = filterVehicles(catalog.vehicles, filters, catalog);
    return resolveVehicles(sortVehicles(filtered, sort), catalog);
  }, [catalog, filters, sort]);

  const chips = getActiveFilterChips(filters, catalog);

  function reset() {
    setFilters(createDefaultFilters());
    setSort("featured");
  }

  return (
    <div className="collection-layout">
      <VehicleSearch
        filters={filters}
        brands={catalog.brands}
        models={catalog.models}
        onChange={setFilters}
        onSubmit={() => undefined}
      />

      <VehicleCategoryNav
        categories={catalog.categories}
        activeId={filters.categoryId}
        onChange={(categoryId) => setFilters({ ...filters, categoryId })}
      />

      <div className="mt-8 flex flex-col gap-4 lg:hidden">
        <div className="flex gap-3">
          <button
            type="button"
            className="collection-apply flex-1"
            aria-expanded={sheetOpen}
            aria-controls={sheetId}
            onClick={() => setSheetOpen(true)}
          >
            Filters
          </button>
          <div className="flex-1">
            <VehicleSort value={sort} onChange={setSort} />
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
        <p className="text-[0.62rem] tracking-[0.28em] text-muted uppercase">
          {records.length} {records.length === 1 ? "vehicle" : "vehicles"}
        </p>
        {hasActiveFilters(filters) ? (
          <ActiveFilters
            chips={chips}
            onRemove={(id) => setFilters(clearFilterField(filters, id))}
            onClear={reset}
          />
        ) : null}
        <div className="hidden lg:block">
          <VehicleSort value={sort} onChange={setSort} />
        </div>
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-[16.5rem_minmax(0,1fr)] lg:items-start">
        <aside className="hidden lg:block">
          <VehicleFiltersPanel
            filters={filters}
            brands={catalog.brands}
            models={catalog.models}
            years={years}
            onChange={setFilters}
          />
        </aside>

        <div>
          {records.length > 0 ? (
            <VehicleGrid records={records} />
          ) : (
            <VehicleEmptyState onReset={reset} />
          )}
        </div>
      </div>

      {sheetOpen ? (
        <div
          id={sheetId}
          className="collection-sheet"
          role="dialog"
          aria-modal="true"
          aria-label="Filters"
        >
          <div className="flex items-center justify-between border-b border-border px-5 py-5">
            <p className="text-[0.62rem] tracking-[0.32em] uppercase">Filters</p>
            <button
              type="button"
              className="text-[0.62rem] tracking-[0.24em] text-muted uppercase"
              onClick={() => setSheetOpen(false)}
            >
              Close
            </button>
          </div>
          <div className="overflow-y-auto px-5 py-6">
            <VehicleFiltersPanel
              filters={filters}
              brands={catalog.brands}
              models={catalog.models}
              years={years}
              onChange={setFilters}
            />
            <button
              type="button"
              className="collection-apply mt-8 w-full"
              onClick={() => setSheetOpen(false)}
            >
              View {records.length} vehicles
            </button>
          </div>
        </div>
      ) : null}
      <CompareBar />
    </div>
  );
}
