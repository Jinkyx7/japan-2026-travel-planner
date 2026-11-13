import { accommodations, type Accommodation } from "../data/accommodations";
import { itinerary } from "../data/itinerary";
import { places } from "../data/places";
import type {
  Currency,
  Expense,
  ExpenseCategory,
  Localized,
  TimelineItem,
  TripDay,
} from "../types";

export type ExpenseTarget = {
  id: string;
  kind: "stay" | "stop";
  title: Localized;
  date: string;
  dayId?: string;
  href: string;
  category: ExpenseCategory;
};

export const stayExpenseId = (stay: Accommodation) =>
  `stay:${stay.placeId}:${stay.checkInDate}`;
const stopExpenseId = (day: TripDay, item: TimelineItem) =>
  `stop:${day.id}:${item.id}`;
function stayForStop(day: TripDay, item: TimelineItem) {
  return item.kind === "stay"
    ? accommodations.find(
        (stay) =>
          stay.placeId === item.placeId &&
          day.date >= stay.checkInDate &&
          day.date <= stay.checkOutDate,
      )
    : undefined;
}

export const expenseTargets: ExpenseTarget[] = [
  ...accommodations.map((stay): ExpenseTarget => ({
    id: stayExpenseId(stay),
    kind: "stay",
    date: stay.checkInDate,
    title: { en: places[stay.placeId].nameEn, zh: places[stay.placeId].nameZh },
    href: `/accommodation/${stay.placeId}`,
    category: "accommodation",
  })),
  ...itinerary.flatMap((day) =>
    day.items
      .filter((item) => !stayForStop(day, item))
      .map((item): ExpenseTarget => ({
        id: stopExpenseId(day, item),
        kind: "stop",
        date: day.date,
        dayId: day.id,
        title: item.title,
        href: `/itinerary/${day.id}/stops/${item.id}${item.plan ? `?plan=${item.plan}` : ""}`,
        category:
          item.kind === "food"
            ? "food"
            : item.kind &&
                ["train", "flight", "bus", "walk"].includes(item.kind)
              ? "transport"
              : "activities",
      })),
  ),
];
const targetById = new Map(expenseTargets.map((target) => [target.id, target]));
export function getExpenseTarget(id?: string | null) {
  return id ? targetById.get(id) : undefined;
}
export function stopExpenseTarget(day: TripDay, item: TimelineItem) {
  const stay = stayForStop(day, item);
  return getExpenseTarget(
    stay ? stayExpenseId(stay) : stopExpenseId(day, item),
  )!;
}

export function linkedPaymentSummary(expenses: Expense[], targetId: string) {
  const payments = expenses.filter((e) => e.linkedItemId === targetId);
  const totals: Partial<Record<Currency, number>> = {};
  for (const payment of payments) {
    const digits = payment.currency === "JPY" ? 1 : 100;
    totals[payment.currency] =
      Math.round(((totals[payment.currency] ?? 0) + payment.amount) * digits) /
      digits;
  }
  return {
    payments,
    totals,
    payerIds: [...new Set(payments.map((e) => e.paidBy))],
    status: !payments.length
      ? "unrecorded"
      : payments.some((e) => e.itemPaidInFull)
        ? "paid"
        : "recorded",
  } as const;
}

export const addLinkedExpenseUrl = (id: string) =>
  `/expenses?${new URLSearchParams({ add: id })}`;
export const linkedExpensesUrl = (id: string) =>
  `/expenses?${new URLSearchParams({ linked: id })}`;
