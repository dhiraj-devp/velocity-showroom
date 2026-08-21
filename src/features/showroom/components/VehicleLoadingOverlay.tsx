"use client";

import { useProgress } from "@react-three/drei";
import { Component, useEffect, useState, type ReactNode } from "react";

export function VehicleLoadingOverlay({ failed }: { failed: boolean }) {
  const { active, progress } = useProgress();
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    if (failed) return;
    if (!active && progress === 100) {
      const timer = window.setTimeout(() => setHidden(true), 450);
      return () => window.clearTimeout(timer);
    }
    return undefined;
  }, [active, failed, progress]);

  if (hidden && !failed) {
    return null;
  }

  return (
    <div
      className="vehicle-loading-overlay pointer-events-none absolute inset-0 z-40 flex items-center justify-center"
      data-ready={!failed && !active && progress === 100 ? "true" : "false"}
      data-failed={failed ? "true" : "false"}
    >
      <div className="px-6 text-center">
        <p className="text-[0.68rem] tracking-[0.38em] text-accent uppercase">
          {failed ? "Vehicle unavailable" : "Preparing vehicle"}
        </p>
        {!failed ? (
          <div className="mx-auto mt-5 h-px w-40 overflow-hidden bg-border">
            <div
              className="h-full bg-accent transition-[width] duration-300 ease-out"
              style={{ width: `${Math.max(8, Math.min(progress, 100))}%` }}
            />
          </div>
        ) : (
          <p className="mt-4 text-sm text-muted">
            The rest of the showroom remains available.
          </p>
        )}
      </div>
    </div>
  );
}

type BoundaryProps = {
  children: ReactNode;
  onError: () => void;
};

type BoundaryState = {
  hasError: boolean;
};

export class VehicleErrorBoundary extends Component<BoundaryProps, BoundaryState> {
  state: BoundaryState = { hasError: false };

  static getDerivedStateFromError(): BoundaryState {
    return { hasError: true };
  }

  componentDidCatch() {
    this.props.onError();
  }

  render() {
    if (this.state.hasError) {
      return null;
    }

    return this.props.children;
  }
}
