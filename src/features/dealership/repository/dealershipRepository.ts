import { isDatabaseConfigured } from "@/db";
import { localDealershipRepository } from "@/features/dealership/repository/localDealershipRepository";
import { mysqlDealershipRepository } from "@/features/dealership/repository/mysqlDealershipRepository";
import type { Dealership } from "@/features/dealership/types";

export const dealershipRepository = {
  async get(): Promise<Dealership> {
    if (isDatabaseConfigured()) {
      return mysqlDealershipRepository.get();
    }
    return localDealershipRepository.get();
  },

  async update(input: Dealership): Promise<void> {
    if (!isDatabaseConfigured()) {
      throw new Error("MySQL is required to update dealership settings.");
    }
    return mysqlDealershipRepository.update(input);
  },
};
