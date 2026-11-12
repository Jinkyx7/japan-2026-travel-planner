import test from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { preferredLanguage } from "../src/lib/language";
import { itinerary } from "../src/data/itinerary";
import { flights } from "../src/data/flights";
import { stopPhoto } from "../src/data/stopPhoto";

test("first visit follows Chinese locales with English fallback; explicit choice wins", () => {
  for (const locale of ["zh-CN", "zh-TW", "zh-Hant-HK", "zh"])
    assert.equal(preferredLanguage(null, locale), "zh");
  for (const locale of ["en-NZ", "ja-JP", "fr-FR", ""])
    assert.equal(preferredLanguage(null, locale), "en");
  assert.equal(preferredLanguage("en", "zh-CN"), "en");
  assert.equal(preferredLanguage("zh", "en-NZ"), "zh");
  assert.equal(preferredLanguage("invalid", "zh-CN"), "zh");
});
test("airport transfers surround flights in travel order and carry route instructions", () => {
  const ids = (date: string) =>
    itinerary.find((d) => d.id === date)!.items.map((i) => i.id);
  assert.ok(
    ids("dec-19").indexOf("airport-to-hotel") >
      ids("dec-19").indexOf("arrival"),
  );
  const tokyo = itinerary.find((d) => d.id === "dec-25")!.items;
  const flight = tokyo.findIndex((i) => i.flightId === "cts-nrt");
  assert.equal(tokyo[flight - 1].id, "airbnb-to-airport");
  assert.equal(tokyo[flight + 1].id, "narita-to-airbnb");
  const transfers = itinerary
    .flatMap((d) => d.items)
    .filter((i) => i.transferSteps);
  assert.equal(transfers.length, 4);
  for (const item of transfers) {
    assert.ok(item.transport);
    assert.ok(item.transferSteps!.length >= 3);
    assert.ok(item.transportSources!.length);
  }
  assert.equal(
    flights.some((f) => f.number === "NZ0289"),
    false,
  );
});
test("every stop detail resolves to a bundled photograph", () => {
  for (const day of itinerary)
    for (const item of day.items) {
      const photo = stopPhoto(day, item);
      assert.ok(photo.src && photo.alt);
      assert.ok(existsSync("public" + photo.src), item.id);
    }
});
