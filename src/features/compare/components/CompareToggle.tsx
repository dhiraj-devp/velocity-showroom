"use client";

import { useCompareList } from "@/features/compare/components/CompareProvider";
import { MAX_COMPARE } from "@/features/compare/lib/state";

export function CompareToggle({ slug }: { slug: string }) {
  const { add, remove, has, full } = useCompareList();
  const selected = has(slug);

  return (
    <button
      type="button"
      className="compare-toggle"
      onClick={() => (selected ? remove(slug) : add(slug))}
      disabled={!selected && full}
    >
      {selected ? "Remove compare" : full ? `Compare full (${MAX_COMPARE})` : "Compare"}
    </button>
  );
}
