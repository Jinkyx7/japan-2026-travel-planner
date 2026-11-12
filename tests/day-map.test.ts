import test from "node:test";
import assert from "node:assert/strict";
import { dayMapPlaces } from "../src/lib/dayMap";
import { itinerary } from "../src/data/itinerary";
test("food suggestions retain timeline numbering and do not duplicate planned meals", () => {
  for (const day of itinerary) {
    for (const plan of ["A", "B"]) {
      const stopIds = [
        ...new Set(
          day.items
            .filter((i) => !i.plan || i.plan === plan)
            .flatMap((i) => (i.placeId ? [i.placeId] : [])),
        ),
      ];
      const points = dayMapPlaces(day, plan);
      assert.deepEqual(
        points.slice(0, stopIds.length).map((p) => p.id),
        stopIds,
      );
      assert.equal(new Set(points.map((p) => p.id)).size, points.length);
    }
  }
  const firstDay = dayMapPlaces(itinerary[0], "A");
  assert.ok(firstDay.some((p) => p.id === "garaku"));
  assert.ok(firstDay.some((p) => p.id === "shingen"));
  assert.equal(
    dayMapPlaces(
      itinerary.find((d) => d.id === "dec-22")!,
      "A",
    ).filter((p) => p.id === "sankaku").length,
    1,
  );
});
