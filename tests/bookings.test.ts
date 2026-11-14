import test from "node:test";
import assert from "node:assert/strict";
import { accommodations } from "../src/data/accommodations";
import { flightById, flights } from "../src/data/flights";
import { itinerary } from "../src/data/itinerary";
import { places } from "../src/data/places";

test("stays cover every Japan night without gaps and link to existing hotel places", () => {
  assert.equal(accommodations[0].checkInDate, "2026-12-19");
  assert.equal(accommodations.at(-1)?.checkOutDate, "2026-12-29");
  accommodations.forEach((stay, index) => {
    assert.equal(places[stay.placeId].category, "hotel");
    assert.ok(stay.checkInDate < stay.checkOutDate);
    if (index)
      assert.equal(accommodations[index - 1].checkOutDate, stay.checkInDate);
  });
});

test("flight timeline references preserve airport dates and distinct Narita terminals", () => {
  for (const day of itinerary)
    for (const item of day.items) {
      if (!item.flightId) continue;
      const flight = flightById[item.flightId];
      assert.ok(flight);
      assert.equal(day.date, flight.departure.date);
      assert.ok(
        item.time?.startsWith(
          item.id === "arrival" ? flight.arrival.time : flight.departure.time,
        ),
      );
    }
  assert.equal(flightById["cts-nrt"].arrival.terminal.en, "Terminal 3");
  assert.equal(flightById["nrt-pvg"].departure.terminal.en, "Terminal 2");
  assert.equal(itinerary.at(-1)?.pending, undefined);
});

test("flight list ends in Wenzhou and omits the later Auckland return", () => {
  assert.deepEqual(
    flights.map((f) => f.id),
    ["pvg-cts", "cts-nrt", "nrt-pvg", "pvg-wnz"],
  );
  assert.equal(flightById["wnz-pvg"], undefined);
  assert.equal(flightById["pvg-akl"], undefined);
});
