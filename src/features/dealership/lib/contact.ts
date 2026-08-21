export function digitsOnly(value: string): string {
  return value.replace(/\D/g, "");
}

export function toTelHref(phone: string): string {
  const trimmed = phone.trim();
  const hasPlus = trimmed.startsWith("+");
  const digits = digitsOnly(trimmed);
  return `tel:${hasPlus ? `+${digits}` : digits}`;
}

export function toWhatsAppNumber(phone: string): string {
  return digitsOnly(phone);
}

export function buildWhatsAppUrl(phone: string, message: string): string {
  const number = toWhatsAppNumber(phone);
  const text = encodeURIComponent(message);
  return `https://wa.me/${number}?text=${text}`;
}
