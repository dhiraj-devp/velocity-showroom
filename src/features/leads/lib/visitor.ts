export const VISITOR_COOKIE = "velocity_visitor";
const VISITOR_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isVisitorKey(value: string | undefined | null): value is string {
  return Boolean(value && VISITOR_PATTERN.test(value) && value.length <= 64);
}

export function newVisitorKey() {
  return crypto.randomUUID();
}
