import { buildWhatsAppUrl, digitsOnly } from "@/features/dealership/lib/contact";
import type { Lead } from "@/features/leads/types";

export function customerWhatsAppDigits(phone: string) {
  const digits = digitsOnly(phone);
  if (digits.length === 10) return `91${digits}`;
  return digits;
}

export function canMessageLeadOnWhatsApp(lead: Pick<Lead, "phone">) {
  return customerWhatsAppDigits(lead.phone).length >= 10;
}

export function customerFollowUpMessage(
  lead: Pick<Lead, "name" | "vehicleName">,
  dealershipName: string,
) {
  const firstName = lead.name.trim().split(/\s+/)[0] || "there";
  const house = dealershipName.trim() || "our dealership";
  const vehicle = lead.vehicleName.trim() || "your enquiry";
  return `Hi ${firstName},\n\nThis is ${house} regarding your enquiry for the ${vehicle}.\n\nHow can we help you today?`;
}

export function customerWhatsAppUrl(
  lead: Pick<Lead, "name" | "phone" | "vehicleName">,
  dealershipName: string,
) {
  const digits = customerWhatsAppDigits(lead.phone);
  if (digits.length < 10) return null;
  return buildWhatsAppUrl(digits, customerFollowUpMessage(lead, dealershipName));
}
