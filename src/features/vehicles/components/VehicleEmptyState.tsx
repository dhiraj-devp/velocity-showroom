type VehicleEmptyStateProps = {
  onReset: () => void;
};

export function VehicleEmptyState({ onReset }: VehicleEmptyStateProps) {
  return (
    <div className="border border-border px-6 py-20 text-center md:px-12">
      <p className="text-[0.62rem] tracking-[0.36em] text-accent uppercase">
        Collection
      </p>
      <h2 className="font-display mt-4 text-3xl tracking-[-0.03em] sm:text-4xl">
        No vehicles found
      </h2>
      <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-muted">
        Adjust your filters or reset the collection to continue browsing.
      </p>
      <button
        type="button"
        onClick={onReset}
        className="mt-8 inline-flex min-h-11 items-center border border-accent bg-accent px-7 py-3 text-[0.68rem] tracking-[0.28em] text-background uppercase"
      >
        Reset filters
      </button>
    </div>
  );
}
