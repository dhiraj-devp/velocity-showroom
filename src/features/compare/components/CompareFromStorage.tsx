"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { compareHref, readStoredCompareSlugs } from "@/features/compare/lib/state";

export function CompareFromStorage({ hasUrlSlugs }: { hasUrlSlugs: boolean }) {
  const router = useRouter();

  useEffect(() => {
    if (hasUrlSlugs) return;
    const stored = readStoredCompareSlugs();
    if (stored.length) router.replace(compareHref(stored), { scroll: false });
  }, [hasUrlSlugs, router]);

  return null;
}
