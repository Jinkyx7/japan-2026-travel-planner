import type { Place } from "../types";

export const mapFilters = [
  { id: "all", en: "All types", zh: "全部类型" },
  { id: "food", en: "Food & cafés", zh: "美食与咖啡" },
  { id: "activities", en: "Things to do", zh: "景点与游玩" },
  { id: "stays", en: "Accommodation", zh: "住宿" },
  { id: "airports", en: "Airports", zh: "机场" },
] as const;
export type MapFilter = (typeof mapFilters)[number]["id"];
/** An empty selection means all types; "all" never coexists with categories. */
export type MapFilterSelection = Exclude<MapFilter, "all">[];

export function toggleMapFilter(
  selected: MapFilterSelection,
  filter: MapFilter,
): MapFilterSelection {
  if (filter === "all") return [];
  return selected.includes(filter)
    ? selected.filter((id) => id !== filter)
    : [...selected, filter];
}

export function matchesMapFilters(place: Place, selected: MapFilterSelection) {
  return (
    !selected.length ||
    selected.some((filter) => matchesMapFilter(place, filter))
  );
}

export function matchesMapFilter(place: Place, filter: MapFilter) {
  switch (filter) {
    case "all":
      return true;
    case "food":
      return place.category === "restaurant" || place.category === "cafe";
    case "activities":
      return [
        "attraction",
        "photo",
        "shopping",
        "station",
        "transport",
      ].includes(place.category);
    case "stays":
      return place.category === "hotel";
    case "airports":
      return place.category === "airport";
  }
}
