import { places } from "../data/places";
import { restaurants } from "../data/restaurants";
import type { TripDay } from "../types";
export function dayMapPlaces(day: TripDay, plan: string) {
  const stopIds = day.items
    .filter((item) => !item.plan || item.plan === plan)
    .flatMap((item) => (item.placeId ? [item.placeId] : []));
  const relatedIds = day.items
    .filter((item) => !item.plan || item.plan === plan)
    .flatMap((item) => item.relatedPlaceIds ?? []);
  const foodIds = restaurants
    .filter((r) => places[r.placeId].area === day.area)
    .map((r) => r.placeId);
  return [...new Set([...stopIds, ...relatedIds, ...foodIds])].map(
    (id) => places[id],
  );
}
