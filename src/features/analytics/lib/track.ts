export const ANALYTICS_EVENTS = [
  "vehicle_view",
  "vehicle_enquiry",
  "whatsapp_click",
  "call_click",
  "viewing_requested",
  "vehicle_360_opened",
  "compare_vehicle_added",
] as const;

export type AnalyticsEventName = (typeof ANALYTICS_EVENTS)[number];

export type AnalyticsPayload = {
  vehicleId?: string;
  slug?: string;
};

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
  }
}

function pushProviders(name: AnalyticsEventName, payload: AnalyticsPayload) {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push({ event: name, ...payload });
  window.gtag?.("event", name, payload);
  window.fbq?.("trackCustom", name, payload);
}

export function trackProductEvent(name: AnalyticsEventName, payload: AnalyticsPayload = {}) {
  pushProviders(name, payload);
}
