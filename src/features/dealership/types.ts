import type { CurrencyCode } from "@/features/vehicles/types";

export type DealershipSocialLinks = {
  instagram?: string;
  youtube?: string;
};

export type Dealership = {
  id: string;
  name: string;
  legalName?: string;
  logo?: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  city: string;
  country: string;
  currency: CurrencyCode;
  primaryContactName?: string;
  openingHours?: string;
  mapsUrl?: string;
  social?: DealershipSocialLinks;
};
