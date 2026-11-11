import { trip } from "../data/trip";
export function japanDate(now = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: trip.timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}
export function tripProgress(date = japanDate()) {
  const diff = Math.round(
    (Date.parse(date + "T00:00:00Z") - Date.parse(trip.start + "T00:00:00Z")) /
      86400000,
  );
  return diff < 0
    ? { phase: "before" as const, days: -diff }
    : diff <= 10
      ? { phase: "during" as const, day: diff + 1 }
      : { phase: "after" as const };
}
export function dateLabel(
  date: string,
  lang: "en" | "zh",
  options: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
    weekday: "short",
  },
) {
  return new Intl.DateTimeFormat(lang === "en" ? "en-GB" : "zh-CN", {
    ...options,
    timeZone: "UTC",
  }).format(new Date(date + "T12:00:00Z"));
}
