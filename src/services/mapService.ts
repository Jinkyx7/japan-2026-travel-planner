import type { Place } from "../types";
export function directionsUrl(
  origin: Place,
  destination: Place,
  mode = "transit",
) {
  return `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(origin.mapQuery ?? origin.nameJa)}&destination=${encodeURIComponent(destination.mapQuery ?? destination.nameJa)}&travelmode=${mode}`;
}
