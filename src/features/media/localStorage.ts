import { mkdir, rm, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

const UPLOAD_ROOT = path.join(process.cwd(), "public", "uploads");
const MAX_BYTES = 8 * 1024 * 1024;
const ALLOWED: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export function isSafeId(id: string) {
  return /^[a-zA-Z0-9_-]+$/.test(id);
}

export async function saveVehicleImage(
  vehicleId: string,
  file: File,
  kind: "gallery" | "360" = "gallery",
) {
  if (!isSafeId(vehicleId)) {
    throw new Error("Invalid vehicle id.");
  }
  const mime = file.type;
  const ext = ALLOWED[mime];
  if (!ext) {
    throw new Error("Use a JPG, PNG, or WebP image.");
  }
  if (file.size > MAX_BYTES) {
    throw new Error("Images must be 8MB or smaller.");
  }

  const filename = `${crypto.randomUUID()}.${ext}`;
  const dir =
    kind === "360"
      ? path.join(UPLOAD_ROOT, "vehicles", vehicleId, "360")
      : path.join(UPLOAD_ROOT, "vehicles", vehicleId);
  await mkdir(dir, { recursive: true });
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(dir, filename), buffer);

  return {
    url:
      kind === "360"
        ? `/uploads/vehicles/${vehicleId}/360/${filename}`
        : `/uploads/vehicles/${vehicleId}/${filename}`,
    filename,
  };
}

export async function deleteStoredUpload(url: string) {
  if (!url.startsWith("/uploads/")) return;
  const relative = url.replace(/^\/+/, "");
  const absolute = path.resolve(process.cwd(), "public", relative);
  const root = path.resolve(UPLOAD_ROOT);
  if (!absolute.startsWith(root + path.sep) && absolute !== root) return;
  await unlink(absolute).catch(() => undefined);
}

export async function deleteVehicleUploadDir(vehicleId: string) {
  if (!isSafeId(vehicleId)) return;
  await rm(path.join(UPLOAD_ROOT, "vehicles", vehicleId), {
    recursive: true,
    force: true,
  }).catch(() => undefined);
}
