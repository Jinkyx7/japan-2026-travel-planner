import test from "node:test";
import assert from "node:assert/strict";
import { accommodations } from "../src/data/accommodations";
import { itinerary } from "../src/data/itinerary";
import { expenseSummary } from "../src/lib/expenses";
import { initialTravellers } from "../src/data/travellers";
import {
  expenseTargets,
  getExpenseTarget,
  stayExpenseId,
  stopExpenseTarget,
  linkedPaymentSummary,
  addLinkedExpenseUrl,
} from "../src/lib/expenseLinks";
import type { Expense } from "../src/types";

const stayId = stayExpenseId(accommodations[0]);
const payment = (overrides: Partial<Expense> = {}): Expense => ({
  id: "payment-1",
  description: "Hotel deposit",
  amount: 10000,
  currency: "JPY",
  category: "accommodation",
  paidBy: "traveller-1",
  date: "2026-11-13",
  participantIds: ["traveller-1", "traveller-2", "traveller-3"],
  linkedItemId: stayId,
  ...overrides,
});

test("stays have one stable target shared by check-in, checkout and booking details", () => {
  assert.equal(
    new Set(expenseTargets.map((target) => target.id)).size,
    expenseTargets.length,
  );
  for (const stay of accommodations)
    assert.ok(getExpenseTarget(stayExpenseId(stay)));
  const checkIn = itinerary[0].items.find((item) => item.id === "hotel")!;
  const checkout = itinerary[1].items.find((item) => item.id === "morning")!;
  assert.equal(stopExpenseTarget(itinerary[0], checkIn).id, stayId);
  assert.equal(stopExpenseTarget(itinerary[1], checkout).id, stayId);
  assert.equal(getExpenseTarget(stayId)?.href, "/accommodation/gracery");
});

test("activity links are scoped to the exact day and stop, preserving alternative plans", () => {
  for (const day of itinerary)
    for (const item of day.items) {
      const target = stopExpenseTarget(day, item);
      assert.ok(target, `${day.id}/${item.id}`);
      if (target.kind === "stop") {
        assert.equal(target.id, `stop:${day.id}:${item.id}`);
        if (item.plan)
          assert.equal(
            new URL(target.href, "https://example.test").searchParams.get(
              "plan",
            ),
            item.plan,
          );
      }
    }
  assert.equal(getExpenseTarget("missing"), undefined);
  assert.equal(
    new URL(
      addLinkedExpenseUrl(stayId),
      "https://example.test",
    ).searchParams.get("add"),
    stayId,
  );
});

test("deposits never imply paid in full, and removing the completing payment reverts the status", () => {
  const deposit = payment();
  const balance = payment({
    id: "balance",
    amount: 20000,
    paidBy: "traveller-2",
    itemPaidInFull: true,
  });
  assert.equal(linkedPaymentSummary([], stayId).status, "unrecorded");
  assert.equal(linkedPaymentSummary([deposit], stayId).status, "recorded");
  const complete = linkedPaymentSummary([deposit, balance], stayId);
  assert.equal(complete.status, "paid");
  assert.deepEqual(complete.payerIds, ["traveller-1", "traveller-2"]);
  assert.deepEqual(complete.totals, { JPY: 30000 });
  assert.equal(
    linkedPaymentSummary(
      [deposit, { ...balance, linkedItemId: undefined }],
      stayId,
    ).status,
    "recorded",
  );
  assert.equal(linkedPaymentSummary([deposit], stayId).status, "recorded");
});

test("linked totals retain original currencies and don't count payments twice in settlement", () => {
  const payments = [
    payment(),
    payment({ id: "second", amount: 0.1, currency: "NZD" }),
    payment({ id: "third", amount: 0.2, currency: "NZD" }),
    payment({ id: "other", linkedItemId: "stop:dec-19:tv-tower", amount: 500 }),
  ];
  assert.deepEqual(linkedPaymentSummary(payments, stayId).totals, {
    JPY: 10000,
    NZD: 0.3,
  });
  const linked = expenseSummary(payments, initialTravellers);
  const plain = expenseSummary(
    payments.map(({ linkedItemId, itemPaidInFull, ...expense }) => expense),
    initialTravellers,
  );
  assert.deepEqual(linked, plain);
});
