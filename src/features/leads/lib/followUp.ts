import type { FollowUpState } from "@/features/leads/types";

export const DESK_TIME_ZONE = "Asia/Kolkata";

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const TIME_PATTERN = /^\d{2}:\d{2}$/;

function pad(value: number) {
  return String(value).padStart(2, "0");
}

export function deskDateParts(date = new Date(), timeZone = DESK_TIME_ZONE) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const read = (type: string) => parts.find((part) => part.type === type)?.value ?? "";
  return {
    year: read("year"),
    month: read("month"),
    day: read("day"),
    hour: read("hour"),
    minute: read("minute"),
  };
}

export function deskYmd(date = new Date(), timeZone = DESK_TIME_ZONE) {
  const parts = deskDateParts(date, timeZone);
  return `${parts.year}-${parts.month}-${parts.day}`;
}

export function deskDayBounds(date = new Date(), timeZone = DESK_TIME_ZONE) {
  const ymd = deskYmd(date, timeZone);
  const startToday = new Date(`${ymd}T00:00:00+05:30`);
  const startTomorrow = new Date(startToday.getTime() + 24 * 60 * 60 * 1000);
  const startWeek = startOfDeskWeek(startToday);
  return { ymd, startToday, startTomorrow, startWeek };
}

function startOfDeskWeek(startToday: Date) {
  const weekday = new Intl.DateTimeFormat("en-US", {
    timeZone: DESK_TIME_ZONE,
    weekday: "short",
  }).format(startToday);
  const offset = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].indexOf(weekday);
  const daysFromMonday = offset === -1 ? 0 : offset;
  return new Date(startToday.getTime() - daysFromMonday * 24 * 60 * 60 * 1000);
}

export function followUpFromToday(days: number, time = "10:00") {
  if (!Number.isInteger(days) || days < 1 || days > 30) return null;
  const target = new Date(deskDayBounds().startToday.getTime() + days * 24 * 60 * 60 * 1000);
  return parseFollowUpInput(deskYmd(target), time);
}

export function parseFollowUpInput(date: string, time: string) {
  if (!DATE_PATTERN.test(date) || !TIME_PATTERN.test(time)) return null;
  const [year, month, day] = date.split("-").map(Number);
  const [hour, minute] = time.split(":").map(Number);
  if (
    month < 1 ||
    month > 12 ||
    day < 1 ||
    day > 31 ||
    hour > 23 ||
    minute > 59
  ) {
    return null;
  }
  const iso = `${year}-${pad(month)}-${pad(day)}T${pad(hour)}:${pad(minute)}:00+05:30`;
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
}

export function getFollowUpState(
  nextFollowUpAt: string | Date | null | undefined,
  now = new Date(),
): FollowUpState {
  if (!nextFollowUpAt) return "unscheduled";
  const at = nextFollowUpAt instanceof Date ? nextFollowUpAt : new Date(nextFollowUpAt);
  if (Number.isNaN(at.getTime())) return "unscheduled";
  const { startToday, startTomorrow } = deskDayBounds(now);
  if (at < startToday) return "overdue";
  if (at < startTomorrow) return "today";
  return "upcoming";
}

export function followUpStateLabel(state: FollowUpState) {
  if (state === "overdue") return "Overdue";
  if (state === "today") return "Today";
  if (state === "upcoming") return "Upcoming";
  return "No follow-up scheduled";
}

export function overdueDurationLabel(
  nextFollowUpAt: string | Date,
  now = new Date(),
) {
  const at = nextFollowUpAt instanceof Date ? nextFollowUpAt : new Date(nextFollowUpAt);
  if (Number.isNaN(at.getTime())) return "Overdue";
  const startFollow = new Date(`${deskYmd(at)}T00:00:00+05:30`);
  const startToday = deskDayBounds(now).startToday;
  const days = Math.max(1, Math.round((startToday.getTime() - startFollow.getTime()) / 86400000));
  return days === 1 ? "1 day overdue" : `${days} days overdue`;
}

export function formatDeskDateTime(value?: string | Date | null) {
  if (!value) return "—";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: DESK_TIME_ZONE,
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(date);
}

export function toDateInputValue(value?: string | Date | null) {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return deskYmd(date);
}

export function toTimeInputValue(value?: string | Date | null) {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const parts = deskDateParts(date);
  return `${parts.hour}:${parts.minute}`;
}
