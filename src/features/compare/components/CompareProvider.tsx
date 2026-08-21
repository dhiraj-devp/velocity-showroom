"use client";

import { createContext, useCallback, useContext, useMemo, useSyncExternalStore, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { trackProductEvent } from "@/features/analytics/lib/track";
import {
  COMPARE_STORAGE_KEY,
  MAX_COMPARE,
  compareHref,
  readStoredCompareSlugs,
  uniqueCompareSlugs,
  writeStoredCompareSlugs,
} from "@/features/compare/lib/state";

type CompareContextValue = {
  slugs: string[];
  add: (slug: string) => boolean;
  remove: (slug: string) => void;
  has: (slug: string) => boolean;
  full: boolean;
  replaceSlugs: (slugs: string[]) => void;
};

const CompareContext = createContext<CompareContextValue | null>(null);
const COMPARE_EVENT = "velocity-compare";

function subscribe(onStoreChange: () => void) {
  window.addEventListener(COMPARE_EVENT, onStoreChange);
  return () => window.removeEventListener(COMPARE_EVENT, onStoreChange);
}

function getSnapshot() {
  try {
    return sessionStorage.getItem(COMPARE_STORAGE_KEY) ?? "[]";
  } catch {
    return "[]";
  }
}

function emitCompareChange() {
  window.dispatchEvent(new Event(COMPARE_EVENT));
}

export function CompareProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const raw = useSyncExternalStore(subscribe, getSnapshot, () => "[]");
  const slugs = useMemo(() => {
    try {
      const parsed = JSON.parse(raw) as unknown;
      if (!Array.isArray(parsed)) return [];
      return uniqueCompareSlugs(parsed.filter((item): item is string => typeof item === "string"));
    } catch {
      return [];
    }
  }, [raw]);

  const persist = useCallback(
    (next: string[]) => {
      const unique = uniqueCompareSlugs(next);
      writeStoredCompareSlugs(unique);
      emitCompareChange();
      if (pathname === "/compare") {
        const href = compareHref(unique);
        if (`${window.location.pathname}${window.location.search}` !== href) {
          router.replace(href, { scroll: false });
        }
      }
    },
    [pathname, router],
  );

  const value = useMemo<CompareContextValue>(
    () => ({
      slugs,
      add: (slug: string) => {
        const current = readStoredCompareSlugs();
        if (current.includes(slug) || current.length >= MAX_COMPARE) return false;
        persist([...current, slug]);
        trackProductEvent("compare_vehicle_added", { slug });
        return true;
      },
      remove: (slug: string) =>
        persist(readStoredCompareSlugs().filter((item) => item !== slug)),
      has: (slug: string) => slugs.includes(slug),
      full: slugs.length >= MAX_COMPARE,
      replaceSlugs: persist,
    }),
    [persist, slugs],
  );

  return <CompareContext.Provider value={value}>{children}</CompareContext.Provider>;
}

export function useCompareList() {
  const value = useContext(CompareContext);
  if (!value) {
    throw new Error("useCompareList must be used within CompareProvider.");
  }
  return value;
}
