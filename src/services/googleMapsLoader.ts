import { importLibrary, setOptions } from "@googlemaps/js-api-loader";

let loading: Promise<void> | undefined;

// Share the SDK across map, food and daily panels. No duplicate script loads.
export function loadGoogleMaps() {
  if (!loading) {
    setOptions({ key: import.meta.env.VITE_GOOGLE_MAPS_API_KEY, v: "weekly" });
    loading = Promise.all([
      importLibrary("maps"),
      importLibrary("marker"),
    ]).then(() => undefined);
  }
  return loading;
}
