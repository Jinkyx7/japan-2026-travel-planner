import type { Expense, Traveller } from "../types";
import { initialTravellers } from "../data/travellers";
const prefix = "japan2026:v1:";
export function readStored<T>(key: string, fallback: T): T {
  const raw = localStorage.getItem(prefix + key);
  if (raw === null) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    throw new Error("Saved data could not be read.");
  }
}
export function writeStored<T>(key: string, value: T) {
  localStorage.setItem(prefix + key, JSON.stringify(value));
}
export interface ExpenseRepository {
  getExpenses(): Promise<Expense[]>;
  addExpense(expense: Expense): Promise<void>;
  updateExpense(expense: Expense): Promise<void>;
  deleteExpense(id: string): Promise<void>;
}
export class LocalStorageExpenseRepository implements ExpenseRepository {
  async getExpenses() {
    const data = readStored<Expense[]>("expenses", []);
    if (
      !Array.isArray(data) ||
      data.some(
        (e) =>
          !e ||
          typeof e.id !== "string" ||
          typeof e.description !== "string" ||
          !Number.isFinite(e.amount) ||
          e.amount <= 0 ||
          !["JPY", "NZD", "CNY"].includes(e.currency) ||
          ![
            "food",
            "transport",
            "accommodation",
            "shopping",
            "activities",
            "other",
          ].includes(e.category) ||
          !initialTravellers.some((p) => p.id === e.paidBy) ||
          !/^\d{4}-\d{2}-\d{2}$/.test(e.date) ||
          !Number.isFinite(Date.parse(e.date)) ||
          !Array.isArray(e.participantIds) ||
          !e.participantIds.length ||
          new Set(e.participantIds).size !== e.participantIds.length ||
          e.participantIds.some(
            (id) => !initialTravellers.some((p) => p.id === id),
          ),
      )
    ) {
      throw new Error("Saved expenses have an unsupported format.");
    }
    return data;
  }
  async addExpense(expense: Expense) {
    const data = await this.getExpenses();
    writeStored("expenses", [...data, expense]);
  }
  async updateExpense(expense: Expense) {
    writeStored(
      "expenses",
      (await this.getExpenses()).map((e) =>
        e.id === expense.id ? expense : e,
      ),
    );
  }
  async deleteExpense(id: string) {
    writeStored(
      "expenses",
      (await this.getExpenses()).filter((e) => e.id !== id),
    );
  }
}
export const expenseRepository: ExpenseRepository =
  new LocalStorageExpenseRepository();
export interface ShoppingRepository {
  getChecked(): Promise<string[]>;
  setChecked(ids: string[]): Promise<void>;
}
export class LocalStorageShoppingRepository implements ShoppingRepository {
  async getChecked() {
    const data = readStored<string[]>("shopping", []);
    if (!Array.isArray(data) || data.some((id) => typeof id !== "string")) {
      throw new Error("Saved checklist has an unsupported format.");
    }
    return data;
  }
  async setChecked(ids: string[]) {
    writeStored("shopping", ids);
  }
}
export const shoppingRepository: ShoppingRepository =
  new LocalStorageShoppingRepository();
export const travellerRepository = {
  async getAll() {
    const data = readStored<Traveller[]>("travellers", initialTravellers);
    if (
      !Array.isArray(data) ||
      data.length !== initialTravellers.length ||
      data.some(
        (p, i) =>
          !p ||
          p.id !== initialTravellers[i].id ||
          typeof p.displayName !== "string",
      )
    ) {
      throw new Error("Saved travellers have an unsupported format.");
    }
    return data;
  },
  async save(travellers: Traveller[]) {
    writeStored("travellers", travellers);
  },
};
