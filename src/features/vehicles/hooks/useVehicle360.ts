"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type PointerEvent } from "react";
import {
  DEFAULT_360_SENSITIVITY,
  getFrameIndex,
  wrapFrameIndex,
} from "@/features/vehicles/lib/frameIndex";
import type { Vehicle360Frame } from "@/features/vehicles/types";

const preloaded = new Set<string>();

function preload(src: string) {
  if (!src || preloaded.has(src)) return;
  preloaded.add(src);
  const image = new Image();
  image.src = src;
}

export function useVehicle360(frames: Vehicle360Frame[]) {
  const ordered = useMemo(
    () => [...frames].sort((a, b) => a.sortOrder - b.sortOrder || a.id.localeCompare(b.id)),
    [frames],
  );
  const [index, setIndex] = useState(0);
  const [loadedId, setLoadedId] = useState<string | null>(null);
  const indexRef = useRef(0);
  const drag = useRef<{ pointerId: number; startX: number; startIndex: number } | null>(null);

  const frameCount = ordered.length;
  const safeIndex = frameCount === 0 ? 0 : wrapFrameIndex(index, frameCount);
  const current = ordered[safeIndex];
  const loaded = Boolean(current && current.id === loadedId);

  useEffect(() => {
    if (frameCount === 0) return;
    for (const offset of [-2, -1, 0, 1, 2]) {
      preload(ordered[wrapFrameIndex(safeIndex + offset, frameCount)].src);
    }
  }, [frameCount, ordered, safeIndex]);

  useEffect(() => {
    const sources = ordered.map((frame) => frame.src);
    let cancelled = false;
    const rest = () => {
      if (cancelled) return;
      for (const src of sources) preload(src);
    };
    let idle = 0;
    if (typeof window.requestIdleCallback === "function") {
      idle = window.requestIdleCallback(rest);
    } else {
      idle = window.setTimeout(rest, 400);
    }
    return () => {
      cancelled = true;
      if (typeof window.cancelIdleCallback === "function") {
        window.cancelIdleCallback(idle);
      } else {
        window.clearTimeout(idle);
      }
    };
  }, [ordered]);

  const commitIndex = useCallback((next: number) => {
    if (next === indexRef.current) return;
    indexRef.current = next;
    setIndex(next);
  }, []);

  const onPointerDown = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      event.currentTarget.setPointerCapture(event.pointerId);
      drag.current = {
        pointerId: event.pointerId,
        startX: event.clientX,
        startIndex: wrapFrameIndex(indexRef.current, frameCount),
      };
    },
    [frameCount],
  );

  const onPointerMove = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      const active = drag.current;
      if (!active || active.pointerId !== event.pointerId || frameCount === 0) return;
      event.preventDefault();
      const next = getFrameIndex({
        currentIndex: active.startIndex,
        dragDelta: event.clientX - active.startX,
        frameCount,
        sensitivity: DEFAULT_360_SENSITIVITY,
      });
      commitIndex(next);
    },
    [commitIndex, frameCount],
  );

  const endDrag = useCallback((event: PointerEvent<HTMLDivElement>) => {
    if (drag.current?.pointerId === event.pointerId) drag.current = null;
  }, []);

  const step = useCallback(
    (delta: number) => {
      if (frameCount === 0) return;
      commitIndex(wrapFrameIndex(indexRef.current + delta, frameCount));
    },
    [commitIndex, frameCount],
  );

  return {
    ordered,
    index: safeIndex,
    current,
    loaded,
    markLoaded: (id: string) => setLoadedId(id),
    step,
    bind: {
      onPointerDown,
      onPointerMove,
      onPointerUp: endDrag,
      onPointerCancel: endDrag,
    },
  };
}
