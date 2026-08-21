const MAX_DEAL_VALUE = 10_000_000_000;

export function parseDealValue(raw: FormDataEntryValue | null): {
  kind: "empty" | "value" | "invalid";
  value?: number;
} {
  const text = String(raw ?? "").trim().replace(/,/g, "");
  if (!text) return { kind: "empty" };
  if (!/^\d+$/.test(text)) return { kind: "invalid" };
  const value = Number(text);
  if (!Number.isInteger(value) || value < 1 || value > MAX_DEAL_VALUE) {
    return { kind: "invalid" };
  }
  return { kind: "value", value };
}
