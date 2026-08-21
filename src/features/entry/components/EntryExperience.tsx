"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { EntryAction } from "@/features/entry/components/EntryAction";
import { EntryBackground } from "@/features/entry/components/EntryBackground";
import { EntryLogo } from "@/features/entry/components/EntryLogo";
import { ENTRY_EXIT_MS, ENTRY_READY_MS } from "@/features/entry/constants";
import { useEntryReducedMotion } from "@/features/entry/hooks/useEntryReducedMotion";

type EntryStage = "intro" | "ready" | "exiting";

type EntryExperienceProps = {
  onComplete: () => void;
};

export function EntryExperience({ onComplete }: EntryExperienceProps) {
  const reducedMotion = useEntryReducedMotion();
  const overlayRef = useRef<HTMLDivElement>(null);
  const completeRef = useRef(onComplete);
  const [stage, setStage] = useState<EntryStage>("intro");
  const visualStage: EntryStage =
    stage === "exiting"
      ? "exiting"
      : reducedMotion || stage === "ready"
        ? "ready"
        : "intro";

  useEffect(() => {
    completeRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    if (reducedMotion) return;

    const timer = window.setTimeout(() => {
      setStage((current) => (current === "intro" ? "ready" : current));
    }, ENTRY_READY_MS);

    return () => window.clearTimeout(timer);
  }, [reducedMotion]);

  useEffect(() => {
    if (visualStage === "exiting") return;

    const overlay = overlayRef.current;
    if (!overlay) return;

    const focusTarget =
      overlay.querySelector<HTMLButtonElement>("button:not([disabled])") ??
      overlay;

    focusTarget.focus();
  }, [visualStage]);

  const enter = useCallback(() => {
    setStage((current) => (current === "exiting" ? current : "exiting"));
  }, []);

  useEffect(() => {
    if (stage !== "exiting") return;

    const timer = window.setTimeout(() => {
      completeRef.current();
    }, reducedMotion ? 280 : ENTRY_EXIT_MS);

    return () => window.clearTimeout(timer);
  }, [reducedMotion, stage]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      if (visualStage === "intro") return;
      event.preventDefault();
      enter();
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [enter, visualStage]);

  useEffect(() => {
    function onFocusIn(event: FocusEvent) {
      const overlay = overlayRef.current;
      if (!overlay) return;
      if (overlay.contains(event.target as Node)) return;
      const next =
        overlay.querySelector<HTMLButtonElement>("button:not([disabled])") ??
        overlay;
      next.focus();
    }

    document.addEventListener("focusin", onFocusIn);
    return () => document.removeEventListener("focusin", onFocusIn);
  }, []);

  return (
    <div
      ref={overlayRef}
      className="entry-overlay"
      data-stage={visualStage}
      data-reduced={reducedMotion ? "true" : "false"}
      role="dialog"
      aria-modal="true"
      aria-labelledby="entry-heading"
      aria-describedby="entry-collection"
      tabIndex={visualStage === "intro" ? 0 : -1}
    >
      <EntryBackground />
      <div className="entry-content">
        <EntryLogo />
        <EntryAction
          ready={visualStage !== "intro"}
          exiting={visualStage === "exiting"}
          onEnter={enter}
        />
      </div>
    </div>
  );
}
