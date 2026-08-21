import {
  deleteStoredUpload,
  deleteVehicleUploadDir,
  saveVehicleImage,
} from "@/features/media/localStorage";

export type StoredUpload = {
  url: string;
  filename: string;
};

/**
 * Local public-folder storage used in development.
 * Swap this module later for Cloudinary, S3, or another object store
 * without changing vehicle admin UI.
 */
export const mediaStorage = {
  saveVehicleImage,
  deleteStoredUpload,
  deleteVehicleUploadDir,
};
