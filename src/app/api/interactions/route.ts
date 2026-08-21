import { isDatabaseConfigured } from "@/db";
import { leadRepository } from "@/features/leads/repository/leadRepository";
import { ensureVisitorKey } from "@/features/leads/lib/visitorCookie";
import { vehicleRepository } from "@/features/vehicles/repository/vehicleRepository";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

function readId(value: unknown) {
  return typeof value === "string" && value.length > 0 && value.length <= 64 ? value : "";
}

export async function POST(request: NextRequest) {
  if (!isDatabaseConfigured()) {
    return new Response(null, { status: 204 });
  }

  let payload: unknown = null;
  try {
    payload = await request.json();
  } catch {
    return new Response(null, { status: 204 });
  }

  const kind =
    payload &&
    typeof payload === "object" &&
    "kind" in payload &&
    (payload.kind === "whatsapp" || payload.kind === "call")
      ? payload.kind
      : null;
  const vehicleId =
    payload && typeof payload === "object" && "vehicleId" in payload
      ? readId(payload.vehicleId)
      : "";

  if (!kind || !vehicleId) {
    return new Response(null, { status: 204 });
  }

  try {
    const record = await vehicleRepository.getVehicleById(vehicleId);
    if (!record) {
      return new Response(null, { status: 204 });
    }
    const visitorKey = await ensureVisitorKey();
    await leadRepository.trackPublicClick({
      kind,
      vehicleId: record.vehicle.id,
      vehicleName: `${record.brand.name} ${record.vehicle.name}`,
      vehicleSlug: record.vehicle.slug,
      visitorKey,
    });
  } catch {
    // Best-effort tracking must not surface database errors to the browser.
  }

  return new Response(null, { status: 204 });
}
