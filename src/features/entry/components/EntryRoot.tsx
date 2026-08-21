"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import { EntryExperience } from "@/features/entry/components/EntryExperience";
import { useEntryExperience } from "@/features/entry/hooks/useEntryExperience";
import "@/features/entry/entry.css";

type EntryRootProps = {
  children: ReactNode;
};

export function EntryRoot({ children }: EntryRootProps) {
  const { hasSeen, isClient, markSeen } = useEntryExperience();
  const [exited, setExited] = useState(false);
  const blocking = !hasSeen && !exited;
  const inertSite = isClient && blocking;

  const complete = useCallback(() => {
    markSeen();
    setExited(true);
    window.requestAnimationFrame(() => {
      document.getElementById("main")?.focus();
    });
  }, [markSeen]);

  useEffect(() => {
    if (!blocking) return;

    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [blocking]);

  return (
    <>
      {isClient && blocking ? (
        <EntryExperience onComplete={complete} />
      ) : !isClient ? (
        <div className="entry-overlay" aria-hidden="true" />
      ) : null}
      <div {...(inertSite ? { inert: true } : {})}>{children}</div>
    </>
  );
}
