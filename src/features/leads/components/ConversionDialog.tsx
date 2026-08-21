"use client";

import { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import type { ReactNode } from "react";

type ConversionDialogProps = {
  open: boolean;
  title: string;
  eyebrow: string;
  onClose: () => void;
  children: ReactNode;
};

export function ConversionDialog({
  open,
  title,
  eyebrow,
  onClose,
  children,
}: ConversionDialogProps) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const lastFocus = useRef<HTMLElement | null>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) return;

    lastFocus.current = document.activeElement as HTMLElement | null;
    document.body.style.overflow = "hidden";

    const panel = panelRef.current;
    const focusable = panel?.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    focusable?.[0]?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onCloseRef.current();
        return;
      }

      if (event.key !== "Tab" || !focusable || focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
      lastFocus.current?.focus();
    };
  }, [open]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div className="conversion-dialog">
      <button
        type="button"
        className="conversion-dialog-backdrop"
        aria-label="Close"
        onClick={onClose}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="conversion-dialog-panel"
      >
        <div className="flex items-start justify-between gap-6">
          <div>
            <p className="text-[0.58rem] tracking-[0.32em] text-accent uppercase">
              {eyebrow}
            </p>
            <h2
              id={titleId}
              className="font-display mt-2 text-2xl tracking-[-0.03em] sm:text-3xl"
            >
              {title}
            </h2>
          </div>
          <button
            type="button"
            className="text-[0.58rem] tracking-[0.24em] text-muted uppercase"
            onClick={onClose}
          >
            Close
          </button>
        </div>
        <div className="mt-8">{children}</div>
      </div>
    </div>,
    document.body,
  );
}
