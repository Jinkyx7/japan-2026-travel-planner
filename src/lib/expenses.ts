import type { Currency, Expense, Traveller } from "../types";
import { exchangeRates } from "../data/exchangeRates";
export const currencyDigits = (c: Currency) => (c === "JPY" ? 0 : 2);
export function money(n: number, c: Currency = "JPY", lang = "en") {
  return new Intl.NumberFormat(lang === "zh" ? "zh-CN" : "en-NZ", {
    style: "currency",
    currencyDisplay: "narrowSymbol",
    currency: c,
    maximumFractionDigits: currencyDigits(c),
  }).format(n);
}
export function convertedExpenseTotal(expenses: Expense[], currency: Currency) {
  // Convert original amounts directly; the JPY settlement rounds each transaction
  // to whole yen and would introduce extra rounding if reused for CNY totals.
  const total = expenses.reduce(
    (sum, expense) =>
      sum +
      (expense.amount * exchangeRates.rates[expense.currency]) /
        exchangeRates.rates[currency],
    0,
  );
  const scale = 10 ** currencyDigits(currency);
  return Math.round((total + Number.EPSILON) * scale) / scale;
}
export function expenseSummary(expenses: Expense[], travellers: Traveller[]) {
  const totals: Record<Currency, number> = { JPY: 0, NZD: 0, CNY: 0 };
  const balances = travellers.map((t) => ({ ...t, paid: 0, owed: 0, net: 0 }));
  for (const e of expenses) {
    totals[e.currency] += e.amount;
    const amount = Math.round(e.amount * exchangeRates.rates[e.currency]);
    const payer = balances.find((t) => t.id === e.paidBy);
    if (payer) payer.paid += amount;
    const participants = e.participantIds;
    const weights = participants.map((id) => e.shares?.[id] ?? 1);
    const totalWeight = weights.reduce((a, b) => a + b, 0);
    if (!participants.length || totalWeight <= 0) continue;
    const raw = weights.map((w) => (amount * w) / totalWeight);
    const shares = raw.map(Math.floor);
    let remainder = amount - shares.reduce((a, b) => a + b, 0);
    const order = raw
      .map((v, i) => ({ i, r: v - shares[i] }))
      .sort((a, b) => b.r - a.r);
    for (const { i } of order) {
      if (remainder-- <= 0) break;
      shares[i]++;
    }
    participants.forEach((id, i) => {
      const t = balances.find((t) => t.id === id);
      if (t) t.owed += shares[i];
    });
  }
  balances.forEach((t) => (t.net = t.paid - t.owed));
  const creditors = balances
    .filter((t) => t.net > 0)
    .map((t) => ({ id: t.id, n: t.net }));
  const debtors = balances
    .filter((t) => t.net < 0)
    .map((t) => ({ id: t.id, n: -t.net }));
  const settlements: { from: string; to: string; amount: number }[] = [];
  for (const debtor of debtors)
    for (const creditor of creditors) {
      const amount = Math.min(debtor.n, creditor.n);
      if (amount > 0) {
        settlements.push({ from: debtor.id, to: creditor.id, amount });
        debtor.n -= amount;
        creditor.n -= amount;
      }
    }
  return {
    totals,
    balances,
    settlements,
    total: balances.reduce((sum, t) => sum + t.paid, 0),
  };
}
