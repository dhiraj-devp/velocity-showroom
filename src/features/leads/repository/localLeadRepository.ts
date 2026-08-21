import type { CreateLeadInput, Lead } from "@/features/leads/types";

const STORAGE_KEY = "velocity-leads";

function readLeads(): Lead[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Lead[];
  } catch {
    return [];
  }
}

function writeLeads(leads: Lead[]) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(leads));
  } catch {
    // Private browsing may block sessionStorage; the in-memory return still works.
  }
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Local lead capture. Replace with an API/MySQL repository later.
 * Does not send email.
 */
export const localLeadRepository = {
  async create(input: CreateLeadInput): Promise<Lead> {
    await wait(450);

    const lead: Lead = {
      id: crypto.randomUUID(),
      dealershipId: input.dealershipId,
      vehicleId: input.vehicleId,
      vehicleName: input.vehicleName,
      vehicleSlug: input.vehicleSlug,
      pagePath: input.pagePath,
      source: input.source,
      name: input.name.trim(),
      phone: input.phone.trim(),
      email: input.email?.trim() || undefined,
      message: input.message?.trim() || undefined,
      status: "new",
      createdAt: new Date().toISOString(),
    };

    const leads = readLeads();
    leads.unshift(lead);
    writeLeads(leads);
    return lead;
  },
};
