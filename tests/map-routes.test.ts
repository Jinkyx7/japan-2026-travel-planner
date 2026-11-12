import test from "node:test";
import assert from "node:assert/strict";
import { itinerary } from "../src/data/itinerary";
import { places } from "../src/data/places";
import { directionsUrl } from "../src/services/mapService";
test("Odori walk uses the recognized park landmark without an invented waypoint", () => {
  const item = itinerary[0].items.find((i) => i.id === "return")!;
  const route = new URL(
    directionsUrl(
      places[item.transport!.originId],
      places[item.transport!.destinationId],
      "walking",
    ),
  );
  assert.equal(route.searchParams.get("origin"), "大通公園 西3丁目 札幌");
  assert.equal(route.searchParams.get("destination"), "ホテルグレイスリー札幌");
  assert.equal(route.searchParams.get("travelmode"), "walking");
  assert.equal(route.searchParams.has("waypoints"), false);
});
test("rail legs use JR Sapporo, while private-stay directions use explicit public station references", () => {
  const airport = itinerary
    .find((d) => d.id === "dec-25")!
    .items.find((i) => i.id === "airbnb-to-airport")!;
  assert.equal(airport.transport!.originId, "sapporo-rail");
  for (const id of ["susukino", "ikebukuro"]) {
    assert.match(places[id].mapQuery!, /駅/);
    assert.ok(places[id].notes?.en && places[id].notes?.zh);
  }
  for (const day of itinerary)
    for (const item of day.items) {
      if (!item.transport) continue;
      assert.ok(places[item.transport.originId]);
      assert.ok(places[item.transport.destinationId]);
    }
});
