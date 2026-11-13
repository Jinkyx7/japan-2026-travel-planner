import type { Expense, Traveller } from "../types";
import type { Database } from "../types/database";
import { requireSupabase } from "./supabase";
import { exchangeRates } from "../data/exchangeRates";

type Row = Database["public"]["Tables"]["trip_expenses"]["Row"];
export class ExpenseConflictError extends Error {}

function fromRow(row: Row): Expense {
  return {
    id: row.id,
    amount: Number(row.amount),
    currency: row.currency as Expense["currency"],
    category: row.category as Expense["category"],
    description: row.description,
    paidBy: row.paid_by,
    date: row.date,
    participantIds: row.participant_ids,
    shares: row.shares as Expense["shares"],
    note: row.note ?? "",
    version: row.version,
    linkedItemId: row.linked_item_id ?? undefined,
    itemPaidInFull: row.item_paid_in_full,
  };
}
function toRow(e: Expense) {
  return {
    id: e.id,
    amount: e.amount,
    currency: e.currency,
    category: e.category,
    description: e.description,
    paid_by: e.paidBy,
    date: e.date,
    participant_ids: e.participantIds,
    shares: e.shares ?? null,
    note: e.note ?? "",
    linked_item_id: e.linkedItemId ?? null,
    item_paid_in_full: !!e.linkedItemId && !!e.itemPaidInFull,
  };
}

async function requireMember() {
  const client = requireSupabase();
  const { data, error } = await client
    .from("trip_members")
    .select("traveller_id")
    .eq("active", true)
    .maybeSingle();
  if (error || !data) throw error ?? new Error("Trip membership required.");
  return client;
}

async function fetchExpenses(linkedIds?: string[]): Promise<Expense[]> {
  const client = await requireMember();
  if (linkedIds && !linkedIds.length) return [];
  const expenses: Expense[] = [];
  // PostgREST caps result sets; never quietly omit older transactions from totals.
  for (let start = 0; ; start += 500) {
    let query = client
      .from("trip_expenses")
      .select("*")
      .order("date", { ascending: false })
      .order("id")
      .range(start, start + 499);
    if (linkedIds) query = query.in("linked_item_id", linkedIds);
    const { data, error } = await query;
    if (error) throw error;
    expenses.push(...data.map(fromRow));
    if (data.length < 500) return expenses;
  }
}

export const expenseRepository = {
  getExpenses: () => fetchExpenses(),
  getLinkedExpenses: (ids: string[]) => fetchExpenses(ids),
  async addExpense(expense: Expense) {
    const { error } = await requireSupabase()
      .from("trip_expenses")
      .insert(toRow(expense));
    if (error) throw error;
  },
  async updateExpense(expense: Expense) {
    if (!expense.version)
      throw new ExpenseConflictError("Reload before editing.");
    const { data, error } = await requireSupabase()
      .from("trip_expenses")
      .update(toRow(expense))
      .eq("id", expense.id)
      .eq("version", expense.version)
      .select("id")
      .maybeSingle();
    if (error) throw error;
    if (!data)
      throw new ExpenseConflictError(
        "This expense changed. Reload before editing.",
      );
  },
  async deleteExpense(id: string, version?: number) {
    if (!version) throw new ExpenseConflictError("Reload before deleting.");
    const { data, error } = await requireSupabase()
      .from("trip_expenses")
      .delete()
      .eq("id", id)
      .eq("version", version)
      .select("id")
      .maybeSingle();
    if (error) throw error;
    if (!data)
      throw new ExpenseConflictError(
        "This expense changed. Reload before deleting.",
      );
  },
  async importExpenses(expenses: Expense[]) {
    // Atomic batch; repeat imports skip existing IDs without overwriting edits.
    const { error } = await requireSupabase()
      .from("trip_expenses")
      .upsert(expenses.map(toRow), {
        onConflict: "id",
        ignoreDuplicates: true,
      });
    if (error) throw error;
  },
};

export function expenseBackup(expenses: Expense[], travellers: Traveller[]) {
  return JSON.stringify(
    {
      schemaVersion: 1,
      trip: "Japan 2026",
      exportedAt: new Date().toISOString(),
      exchangeRates,
      travellers,
      expenses,
    },
    null,
    2,
  );
}
