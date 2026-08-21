"use client";

import { useCallback, useSyncExternalStore } from "react";
import {
  ENTRY_STORAGE_KEY,
  ENTRY_STORAGE_VALUE,
} from "@/features/entry/constants";

function subscribe(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener("velocity-entry-change", onStoreChange);
  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener("velocity-entry-change", onStoreChange);
  };
}

function getSnapshot() {
  try {
    return sessionStorage.getItem(ENTRY_STORAGE_KEY) === ENTRY_STORAGE_VALUE;
  } catch {
    return true;
  }
}

function getServerSnapshot() {
  return false;
}

export function useEntryExperience() {
  const hasSeen = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );
  const isClient = useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false,
  );

  const markSeen = useCallback(() => {
    try {
      sessionStorage.setItem(ENTRY_STORAGE_KEY, ENTRY_STORAGE_VALUE);
    } catch {
      // Private mode or blocked storage should still release the overlay.
    }

    document.documentElement.dataset.entrySeen = "1";
    delete document.documentElement.dataset.entryActive;
    window.dispatchEvent(new Event("velocity-entry-change"));
  }, []);

  return { hasSeen, isClient, markSeen };
}
