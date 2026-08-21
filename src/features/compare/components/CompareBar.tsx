"use client";

import Link from "next/link";
import { useCompareList } from "@/features/compare/components/CompareProvider";
import { compareHref } from "@/features/compare/lib/state";

export function CompareBar() {
  const { slugs } = useCompareList();
  if (slugs.length === 0) return null;

  return (
    <div className="compare-bar">
      <p className="text-[0.62rem] tracking-[0.22em] uppercase">
        Compare {slugs.length} {slugs.length === 1 ? "vehicle" : "vehicles"}
      </p>
      <Link href={compareHref(slugs)} className="collection-apply">
        Open comparison
      </Link>
    </div>
  );
}
