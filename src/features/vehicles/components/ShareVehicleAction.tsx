"use client";

import { useState } from "react";

type ShareVehicleActionProps = {
  title: string;
  text: string;
};

export function ShareVehicleAction({ title, text }: ShareVehicleActionProps) {
  const [note, setNote] = useState<string | null>(null);

  async function share() {
    const url = window.location.href;

    try {
      if (navigator.share) {
        await navigator.share({ title, text, url });
        setNote("Shared.");
        return;
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
    }

    try {
      await navigator.clipboard.writeText(url);
      setNote("Link copied.");
    } catch {
      setNote("Unable to share from this browser.");
    }
  }

  return (
    <span className="inline-flex items-center gap-3">
      <button
        type="button"
        className="text-[0.62rem] tracking-[0.22em] text-muted uppercase transition-colors hover:text-foreground"
        onClick={() => {
          void share();
        }}
      >
        Share
      </button>
      {note ? (
        <span className="text-[0.7rem] text-muted" aria-live="polite">
          {note}
        </span>
      ) : null}
    </span>
  );
}
