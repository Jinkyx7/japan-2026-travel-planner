import test from "node:test";
import assert from "node:assert/strict";
import { mapMarkerKind, mapMarkerSvg } from "../src/lib/mapMarkers";
import { dayMapPlaces } from "../src/lib/dayMap";
import { places } from "../src/data/places";
import {
  mapFilters,
  matchesMapFilter,
  matchesMapFilters,
  toggleMapFilter,
  type MapFilterSelection,
} from "../src/lib/mapFilters";
import { itinerary } from "../src/data/itinerary";

test("map shapes retain each day's numbering across food, stays and other stops", () => {
  for (const day of itinerary)
    for (const plan of ["A", "B"]) {
      dayMapPlaces(day, plan).forEach((place, index) => {
        const kind = mapMarkerKind(place.category);
        const svg = mapMarkerSvg(kind, index + 1);
        assert.equal((svg.match(/<text /g) ?? []).length, 1);
        assert.ok(svg.includes(`>${index + 1}</text>`));
        if (place.category === "restaurant" || place.category === "cafe")
          assert.equal(kind, "food");
        else if (place.category === "hotel") assert.equal(kind, "stay");
        else if (place.category === "airport") assert.equal(kind, "airport");
        else assert.equal(kind, "stop");
      });
    }
});
test("marker SVG contains no labels for unnumbered legends or unsafe input", () => {
  assert.ok(!mapMarkerSvg("food").includes("<text"));
  assert.ok(!mapMarkerSvg("stay", NaN).includes("<text"));
  assert.ok(!mapMarkerSvg("stop", -1).includes("<text"));
  assert.match(mapMarkerSvg("food", 123), /font-size="10"/);
});

test("map filters separate food, activities and airports without dropping places", () => {
  const all = Object.values(places);
  const filters = mapFilters.filter((filter) => filter.id !== "all");
  for (const place of all) {
    assert.equal(
      filters.filter((filter) => matchesMapFilter(place, filter.id)).length,
      1,
    );
    assert.ok(matchesMapFilter(place, "all"));
  }
  assert.deepEqual(
    all
      .filter((p) => matchesMapFilter(p, "airports"))
      .map((p) => p.id)
      .sort(),
    ["cts", "nrt", "nrt-t2", "pvg"],
  );
  assert.ok(
    all
      .filter((p) => matchesMapFilter(p, "activities"))
      .every((p) =>
        ["attraction", "photo", "shopping", "station", "transport"].includes(
          p.category,
        ),
      ),
  );
  assert.ok(
    all
      .filter((p) => matchesMapFilter(p, "food"))
      .every((p) => p.category === "restaurant" || p.category === "cafe"),
  );
});

test("multiple map categories form a union and All resets the selection", () => {
  let selected: MapFilterSelection = [];
  assert.ok(matchesMapFilters(places.cts, selected));
  selected = toggleMapFilter(selected, "food");
  selected = toggleMapFilter(selected, "stays");
  assert.deepEqual(selected, ["food", "stays"]);
  for (const id of ["garaku", "letao", "gracery"])
    assert.ok(matchesMapFilters(places[id], selected));
  for (const id of ["cts", "tv-tower", "tanukikoji"])
    assert.ok(!matchesMapFilters(places[id], selected));
  selected = toggleMapFilter(selected, "food");
  assert.deepEqual(selected, ["stays"]);
  assert.ok(!matchesMapFilters(places.letao, selected));
  selected = toggleMapFilter(selected, "all");
  assert.deepEqual(selected, []);
  assert.ok(Object.values(places).every((p) => matchesMapFilters(p, selected)));
  assert.deepEqual(toggleMapFilter(["food"], "food"), []);
});

test("food includes cafes and Things to do includes shopping and transport", () => {
  assert.ok(matchesMapFilter(places.letao, "food"));
  assert.ok(matchesMapFilter(places.garaku, "food"));
  for (const id of ["tanukikoji", "kamifurano", "sapporo-rail", "tv-tower"]) {
    assert.ok(matchesMapFilter(places[id], "activities"));
  }
  assert.ok(!matchesMapFilter(places.cts, "activities"));
});
