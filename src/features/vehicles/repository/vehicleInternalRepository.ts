import { isDatabaseConfigured } from "@/db";
import type { VehicleInternal, VehicleInternalWriteInput } from "@/features/vehicles/lib/internal";
import { mysqlInternalRepository } from "@/features/vehicles/repository/mysqlInternalRepository";

export const vehicleInternalRepository = {
  async getByVehicleId(vehicleId: string): Promise<VehicleInternal | null> {
    if (!isDatabaseConfigured()) return null;
    return mysqlInternalRepository.getByVehicleId(vehicleId);
  },

  async upsert(vehicleId: string, input: VehicleInternalWriteInput) {
    if (!isDatabaseConfigured()) {
      throw new Error("MySQL is required to save internal vehicle data.");
    }
    return mysqlInternalRepository.upsert(vehicleId, input);
  },
};
