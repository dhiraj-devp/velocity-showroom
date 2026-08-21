export function trackPublicInteraction(kind: "whatsapp" | "call", vehicleId: string) {
  if (!vehicleId || vehicleId.length > 64) return;
  const body = JSON.stringify({ kind, vehicleId });
  try {
    if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
      const payload = new Blob([body], { type: "application/json" });
      navigator.sendBeacon("/api/interactions", payload);
      return;
    }
  } catch {
    // Fall through to fetch.
  }
  void fetch("/api/interactions", {
    method: "POST",
    body,
    headers: { "Content-Type": "application/json" },
    keepalive: true,
    credentials: "same-origin",
  }).catch(() => {
    // Tracking is best-effort and must never block the click.
  });
}
