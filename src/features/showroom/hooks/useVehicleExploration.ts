"use client";

import { useMemo, useSyncExternalStore } from "react";
import {
  EXPLORATION_POINTS,
  getAdjacentPoint,
  getExplorationPreset,
  type ExplorationMode,
  type ExplorationPoint,
} from "@/features/showroom/config/explorationPresets";

export type ExplorationSnapshot = {
  mode: ExplorationMode;
  point: ExplorationPoint;
  requestId: number;
};

const INITIAL_SNAPSHOT: ExplorationSnapshot = {
  mode: "showroom",
  point: "design",
  requestId: 0,
};

const listeners = new Set<() => void>();

let snapshot: ExplorationSnapshot = INITIAL_SNAPSHOT;

function emit() {
  for (const listener of listeners) {
    listener();
  }
}

function subscribe(onStoreChange: () => void) {
  listeners.add(onStoreChange);
  return () => {
    listeners.delete(onStoreChange);
  };
}

function getSnapshot() {
  return snapshot;
}

function getServerSnapshot(): ExplorationSnapshot {
  return INITIAL_SNAPSHOT;
}

function commit(next: ExplorationSnapshot) {
  snapshot = next;
  emit();
}

export function enterExploration(point: ExplorationPoint = "design") {
  commit({
    mode: "exploring",
    point,
    requestId: snapshot.requestId + 1,
  });
}

export function selectExplorationPoint(point: ExplorationPoint) {
  commit({
    mode: "exploring",
    point,
    requestId: snapshot.requestId + 1,
  });
}

export function nextExplorationPoint() {
  selectExplorationPoint(getAdjacentPoint(snapshot.point, 1));
}

export function previousExplorationPoint() {
  selectExplorationPoint(getAdjacentPoint(snapshot.point, -1));
}

export function returnToShowroom() {
  if (snapshot.mode === "showroom") return;
  commit({
    mode: "showroom",
    point: snapshot.point,
    requestId: snapshot.requestId + 1,
  });
}

export function useVehicleExploration() {
  const state = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  return useMemo(
    () => ({
      mode: state.mode,
      point: state.point,
      requestId: state.requestId,
      points: EXPLORATION_POINTS,
      pointIndex: EXPLORATION_POINTS.indexOf(state.point),
      pointCount: EXPLORATION_POINTS.length,
      enterExploration,
      selectPoint: selectExplorationPoint,
      nextPoint: nextExplorationPoint,
      previousPoint: previousExplorationPoint,
      returnToShowroom,
      getPreset: getExplorationPreset,
    }),
    [state],
  );
}
