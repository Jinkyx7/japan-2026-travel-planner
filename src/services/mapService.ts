import { setOptions, importLibrary } from "@googlemaps/js-api-loader";
import type { Place } from "../types";
let loading: Promise<void> | undefined;
export function loadGoogleMaps() {
  if (!loading) {
    setOptions({ key: import.meta.env.VITE_GOOGLE_MAPS_API_KEY, v: "weekly" });
    loading = Promise.all([
      importLibrary("maps"),
      importLibrary("marker"),
    ]).then(() => {});
  }
  return loading;
}
export function directionsUrl(
  origin: Place,
  destination: Place,
  mode = "transit",
) {
  return `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(origin.nameJa)}&destination=${encodeURIComponent(destination.nameJa)}&travelmode=${mode}`;
}
