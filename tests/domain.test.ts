import test from "node:test";
import assert from "node:assert/strict";
import { expenseSummary, convertedExpenseTotal } from "../src/lib/expenses";
import { tripProgress, japanDate } from "../src/lib/trip";
import { initialTravellers } from "../src/data/travellers";
import { itinerary } from "../src/data/itinerary";
import { places } from "../src/data/places";
import { restaurants } from "../src/data/restaurants";
import { shoppingItems } from "../src/data/shopping";
import {
  LocalStorageExpenseRepository,
  LocalStorageShoppingRepository,
} from "../src/services/storage";
import type { Expense } from "../src/types";
const people = initialTravellers.map((t) => t.id);
const expense = (overrides: Partial<Expense> = {}): Expense => ({
  id: "test",
  amount: 9000,
  currency: "JPY",
  category: "food",
  description: "Test meal",
  date: "2026-12-22",
  paidBy: people[0],
  participantIds: people,
  ...overrides,
});
test("equal split gives two transfers of 3000 to the payer", () => {
  const s = expenseSummary([expense()], initialTravellers);
  assert.deepEqual(
    s.balances.map((p) => p.net),
    [6000, -3000, -3000],
  );
  assert.deepEqual(s.settlements, [
    { from: people[1], to: people[0], amount: 3000 },
    { from: people[2], to: people[0], amount: 3000 },
  ]);
});
test("multi-currency conversion retains originals and balances exact yen", () => {
  const input = [
    expense({ amount: 100, currency: "NZD" }),
    expense({ id: "2", amount: 100, currency: "CNY", paidBy: people[1] }),
    expense({ id: "3", amount: 10001, paidBy: people[2] }),
  ];
  const s = expenseSummary(input, initialTravellers);
  assert.deepEqual(s.totals, { JPY: 10001, NZD: 100, CNY: 100 });
  assert.equal(s.total, 21101);
  assert.equal(
    s.balances.reduce((n, p) => n + p.net, 0),
    0,
  );
  assert.equal(
    s.balances.reduce((n, p) => n + p.owed, 0),
    s.total,
  );
  assert.equal(input[0].amount, 100);
  const settled = new Map(s.balances.map((p) => [p.id, p.net]));
  for (const transfer of s.settlements) {
    settled.set(transfer.from, settled.get(transfer.from)! + transfer.amount);
    settled.set(transfer.to, settled.get(transfer.to)! - transfer.amount);
  }
  assert.deepEqual([...settled.values()], [0, 0, 0]);
});
test("payer can be outside participants; custom weights supported", () => {
  const s = expenseSummary(
    [
      expense({
        amount: 100,
        participantIds: people.slice(1),
        shares: { [people[1]]: 1, [people[2]]: 3 },
      }),
    ],
    initialTravellers,
  );
  assert.deepEqual(
    s.balances.map((p) => p.net),
    [100, -25, -75],
  );
});
test("CNY trip total converts original amounts without whole-yen rounding", () => {
  const payments = [
    expense({ amount: 10000, currency: "JPY" }),
    expense({ id: "second-payment", amount: 100.01, currency: "CNY" }),
  ];
  assert.equal(convertedExpenseTotal(payments, "CNY"), 576.2);
  assert.equal(
    convertedExpenseTotal(
      [expense({ amount: 100.01, currency: "CNY" })],
      "CNY",
    ),
    100.01,
  );
  assert.equal(
    convertedExpenseTotal([expense({ amount: 100, currency: "NZD" })], "CNY"),
    428.57,
  );
  assert.equal(convertedExpenseTotal([], "CNY"), 0);
});
test("trip countdown includes all 11 days and uses Japan midnight", () => {
  assert.deepEqual(tripProgress("2026-12-18"), { phase: "before", days: 1 });
  assert.deepEqual(tripProgress("2026-12-19"), { phase: "during", day: 1 });
  assert.deepEqual(tripProgress("2026-12-29"), { phase: "during", day: 11 });
  assert.deepEqual(tripProgress("2026-12-30"), { phase: "after" });
  assert.equal(japanDate(new Date("2026-12-18T15:00:00Z")), "2026-12-19");
});
test("all shared Place references resolve and Tokyo placeholders stay empty", () => {
  assert.equal(itinerary.length, 11);
  for (const day of itinerary) {
    if (day.accommodationId) assert.ok(places[day.accommodationId]);
    for (const item of day.items) {
      if (item.placeId) assert.ok(places[item.placeId]);
      if (item.transport) {
        assert.ok(places[item.transport.originId]);
        assert.ok(places[item.transport.destinationId]);
      }
    }
  }
  for (const r of restaurants) assert.ok(places[r.placeId]);
  for (const item of shoppingItems)
    for (const id of item.recommendedPlaces) assert.ok(places[id]);
  assert.ok(
    itinerary
      .slice(7, 10)
      .every((day) => day.pending && day.items.length === 0),
  );
});
test("repositories persist CRUD and checklist across instances", async () => {
  const memory = new Map<string, string>();
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: {
      getItem: (k: string) => memory.get(k) ?? null,
      setItem: (k: string, v: string) => memory.set(k, v),
    },
  });
  const repo = new LocalStorageExpenseRepository();
  assert.deepEqual(await repo.getExpenses(), []);
  await repo.addExpense(expense());
  await repo.updateExpense(expense({ amount: 12000 }));
  assert.equal(
    (await new LocalStorageExpenseRepository().getExpenses())[0].amount,
    12000,
  );
  await repo.deleteExpense("test");
  assert.deepEqual(await repo.getExpenses(), []);
  await new LocalStorageShoppingRepository().setChecked(["royce"]);
  assert.deepEqual(await new LocalStorageShoppingRepository().getChecked(), [
    "royce",
  ]);
});
test("storage failures propagate rather than reporting successful saves", async () => {
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: {
      getItem: () => null,
      setItem: () => {
        throw new Error("Quota exceeded");
      },
    },
  });
  await assert.rejects(
    () => new LocalStorageExpenseRepository().addExpense(expense()),
    /Quota exceeded/,
  );
});
