import type { Place } from "../types";

export type MapMarkerKind = "stop" | "food" | "stay" | "airport";
export function mapMarkerKind(category: Place["category"]): MapMarkerKind {
  return category === "restaurant" || category === "cafe"
    ? "food"
    : category === "hotel"
      ? "stay"
      : category === "airport"
        ? "airport"
        : "stop";
}

const designs = {
  airport: {
    color: "#65518a",
    path: "M17 3Q20-1 23 3l2 10 13 9v6l-11-3-2 8 5 4v4l-10-3-10 3v-4l5-4-2-8-11 3v-6l13-9Z",
    labelY: 22,
    labelColor: "#fff",
  },
  stop: {
    color: "#2f6b5b",
    path: "M20 2C10.6 2 3 9.6 3 19c0 11 17 23 17 23s17-12 17-23C37 9.6 29.4 2 20 2Z",
    labelY: 19,
    labelColor: "#fff",
  },
  food: {
    color: "#f4c542",
    path: "M3 15h34c-1 13-8 20-17 20S4 28 3 15Zm10 20h14v4H13Z",
    labelY: 24,
    labelColor: "#49330b",
  },
  stay: {
    color: "#466a83",
    path: "M3 18 20 3l17 15v17H25l-5 7-5-7H3Z",
    labelY: 25,
    labelColor: "#fff",
  },
} as const;

/** Shared SVG for Google markers, the offline list and the legend. No external assets. */
export function mapMarkerSvg(kind: MapMarkerKind, number?: number) {
  const design = designs[kind];
  // Only a positive integer can enter the SVG text; place names remain in DOM titles.
  const label =
    Number.isSafeInteger(number) && number! > 0 ? String(number) : "";
  const fontSize =
    label.length > 2 ? 10 : kind === "food" || kind === "airport" ? 13 : 14;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 44" aria-hidden="true" focusable="false"><path class="marker-shape" d="${design.path}" fill="${design.color}" stroke="#fff" stroke-width="2" stroke-linejoin="round"/>${kind === "food" ? `<path d="M6 5l22 9M14 2l20 11" fill="none" stroke="#8a6319" stroke-width="1.4" stroke-linecap="round"/>` : ""}${label ? `<text x="20" y="${design.labelY}" text-anchor="middle" dominant-baseline="central" fill="${design.labelColor}" font-family="system-ui,sans-serif" font-size="${fontSize}" font-weight="700">${label}</text>` : ""}</svg>`;
}
