"use client";

import { useCompareList } from "@/features/compare/components/CompareProvider";
import { useEffect } from "react";

export function PersistCompareSlugs({ slugs }: { slugs: string[] }) {
  const { replaceSlugs } = useCompareList();
  const key = slugs.join(",");

  useEffect(() => {
    if (!key) return;
    replaceSlugs(key.split(","));
  }, [key, replaceSlugs]);

  return null;
}
