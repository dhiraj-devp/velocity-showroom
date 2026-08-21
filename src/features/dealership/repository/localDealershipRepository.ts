import { dealership } from "@/features/dealership/data/dealership";
import type { Dealership } from "@/features/dealership/types";

/**
 * Local dealership settings. Swap for an API/MySQL repository later
 * without changing WhatsApp, Call, or conversion UI.
 */
export const localDealershipRepository = {
  get(): Dealership {
    return dealership;
  },
};
