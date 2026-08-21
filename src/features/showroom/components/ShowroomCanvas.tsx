"use client";

import { Canvas } from "@react-three/fiber";
import { ACESFilmicToneMapping } from "three";
import {
  Component,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { ShowroomScene } from "@/features/showroom/components/ShowroomScene";
import { VehicleLoadingOverlay } from "@/features/showroom/components/VehicleLoadingOverlay";
import {
  SHOWROOM_BACKGROUND,
  getShowroomQuality,
} from "@/features/showroom/config";
import { useReducedMotion } from "@/features/showroom/hooks/useReducedMotion";

type CanvasStatus = "booting" | "ready" | "unsupported";

let webglStatus: Exclude<CanvasStatus, "booting"> | null = null;

function subscribeWebGL() {
  return () => undefined;
}

function getWebGLSnapshot(): CanvasStatus {
  if (webglStatus) return webglStatus;

  const probe = document.createElement("canvas");
  const gl = probe.getContext("webgl2") || probe.getContext("webgl");
  webglStatus = gl ? "ready" : "unsupported";
  return webglStatus;
}

function getWebGLServerSnapshot(): CanvasStatus {
  return "booting";
}

function subscribeResize(onStoreChange: () => void) {
  window.addEventListener("resize", onStoreChange);
  return () => window.removeEventListener("resize", onStoreChange);
}

function getViewportWidth() {
  return window.innerWidth;
}

function getServerViewportWidth() {
  return 1280;
}

export function ShowroomCanvas() {
  const reducedMotion = useReducedMotion();
  const width = useSyncExternalStore(
    subscribeResize,
    getViewportWidth,
    getServerViewportWidth,
  );
  const quality = getShowroomQuality(width);
  const status = useSyncExternalStore(
    subscribeWebGL,
    getWebGLSnapshot,
    getWebGLServerSnapshot,
  );

  const startPosition = reducedMotion
    ? quality.cameraPosition
    : quality.introCameraPosition;
  const [vehicleFailed, setVehicleFailed] = useState(false);

  if (status === "unsupported") {
    return <ShowroomUnavailable />;
  }

  if (status !== "ready") {
    return <ShowroomFallback />;
  }

  return (
    <CanvasErrorBoundary>
      <Canvas
        className="absolute inset-0 h-full w-full touch-none"
        style={{ background: SHOWROOM_BACKGROUND }}
        dpr={[quality.dpr[0], quality.dpr[1]]}
        shadows={false}
        frameloop={reducedMotion ? "demand" : "always"}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: "high-performance",
          stencil: false,
        }}
        camera={{
          position: [startPosition[0], startPosition[1], startPosition[2]],
          fov: quality.fov,
          near: 0.1,
          far: quality.far,
        }}
        onCreated={({ gl, camera, size }) => {
          const framing = getShowroomQuality(size.width);
          const origin = reducedMotion
            ? framing.cameraPosition
            : framing.introCameraPosition;
          gl.setClearColor(SHOWROOM_BACKGROUND, 1);
          gl.toneMapping = ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.02;
          camera.lookAt(framing.target[0], framing.target[1], framing.target[2]);
          camera.position.set(origin[0], origin[1], origin[2]);
          if ("isPerspectiveCamera" in camera && camera.isPerspectiveCamera) {
            camera.fov = framing.fov;
            camera.far = framing.far;
            camera.updateProjectionMatrix();
          }
        }}
        aria-label="Interactive 3D car in a cinematic showroom"
      >
        <ShowroomScene
          reducedMotion={reducedMotion}
          onVehicleError={() => setVehicleFailed(true)}
        />
      </Canvas>
      <VehicleLoadingOverlay failed={vehicleFailed} />
    </CanvasErrorBoundary>
  );
}

function ShowroomFallback() {
  return (
    <div className="absolute inset-0 bg-background" aria-hidden="true">
      <div className="absolute top-[8%] left-1/2 h-px w-2/5 -translate-x-1/2 bg-gradient-to-r from-transparent via-accent/70 to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(198,165,106,0.08),transparent_58%)]" />
    </div>
  );
}

function ShowroomUnavailable() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-background px-6">
      <p className="max-w-sm text-center text-sm leading-relaxed text-muted">
        The 3D showroom cannot run on this device. The rest of the collection
        remains available below.
      </p>
    </div>
  );
}

type BoundaryProps = {
  children: ReactNode;
};

type BoundaryState = {
  hasError: boolean;
};

class CanvasErrorBoundary extends Component<BoundaryProps, BoundaryState> {
  state: BoundaryState = { hasError: false };

  static getDerivedStateFromError(): BoundaryState {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return <ShowroomUnavailable />;
    }

    return this.props.children;
  }
}
