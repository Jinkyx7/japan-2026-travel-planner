import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  Plus,
  Wallet,
  ArrowRight,
  Pencil,
  Trash2,
  X,
  Check,
  Utensils,
  TrainFront,
  BedDouble,
  ShoppingBag,
  Ticket,
  Ellipsis,
} from "lucide-react";
import { useApp } from "../components/AppContext";
import { PageHeading, Tabs, EmptyState } from "../components/UI";
import { expenseRepository } from "../services/storage";
import { expenseSummary, money, currencyDigits } from "../lib/expenses";
import { exchangeRates } from "../data/exchangeRates";
import { japanDate, dateLabel } from "../lib/trip";
import type { Currency, Expense, ExpenseCategory } from "../types";
const categories: {
  id: ExpenseCategory;
  en: string;
  zh: string;
  icon: typeof Wallet;
}[] = [
  { id: "food", en: "Food", zh: "餐饮", icon: Utensils },
  { id: "transport", en: "Transport", zh: "交通", icon: TrainFront },
  { id: "accommodation", en: "Accommodation", zh: "住宿", icon: BedDouble },
  { id: "shopping", en: "Shopping", zh: "购物", icon: ShoppingBag },
  { id: "activities", en: "Activities", zh: "活动", icon: Ticket },
  { id: "other", en: "Other", zh: "其他", icon: Ellipsis },
];
export function Expenses() {
  const { t, lang, travellers } = useApp();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [tab, setTab] = useState("list");
  const [category, setCategory] = useState("all");
  const [person, setPerson] = useState("all");
  const [currency, setCurrency] = useState("all");
  const [editing, setEditing] = useState<Expense | null | undefined>();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string>();
  async function refresh() {
    try {
      setExpenses(await expenseRepository.getExpenses());
      setError("");
    } catch {
      setError(
        t("Saved expenses could not be loaded.", "无法读取已保存的支出。"),
      );
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    void refresh();
  }, []);
  const summary = expenseSummary(expenses, travellers);
  const filtered = expenses
    .filter(
      (e) =>
        (category === "all" || e.category === category) &&
        (person === "all" || e.paidBy === person) &&
        (currency === "all" || e.currency === currency),
    )
    .sort((a, b) => b.date.localeCompare(a.date));
  const name = (id: string) =>
    travellers.find((p) => p.id === id)?.displayName ?? id;
  async function remove(id: string) {
    try {
      await expenseRepository.deleteExpense(id);
      setDeleteId(undefined);
      await refresh();
    } catch {
      setError(t("Could not delete the expense.", "无法删除此支出。"));
    }
  }
  return (
    <>
      <PageHeading
        eyebrow={t("THE LITTLE THINGS, ACCOUNTED FOR", "每一笔，都记在这里")}
        title={t("Expenses", "支出记录")}
        subtitle={t("Spend together. Keep it simple.", "一起旅行，轻松记账。")}
        action={
          <button
            disabled={loading || !!error}
            className="button primary"
            onClick={() => setEditing(null)}
          >
            <Plus size={18} />
            {t("Add expense", "添加支出")}
          </button>
        }
      />
      <Tabs
        value={tab}
        onChange={setTab}
        items={[
          ["list", "List", "列表"],
          ["summary", "Summary", "汇总"],
          ["split", "Split", "结算"],
        ].map(([id, en, zh]) => ({ id, label: t(en, zh) }))}
      />
      {error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}
      {loading ? (
        <p>{t("Loading expenses…", "正在读取支出…")}</p>
      ) : (
        <>
          {tab === "list" && (
            <>
              <div className="expense-filters">
                <label className="sr-only" htmlFor="category-filter">
                  {t("Filter category", "按类别筛选")}
                </label>
                <select
                  id="category-filter"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="all">{t("All categories", "全部类别")}</option>
                  {categories.map((c) => (
                    <option value={c.id} key={c.id}>
                      {t(c.en, c.zh)}
                    </option>
                  ))}
                </select>
                <label className="sr-only" htmlFor="person-filter">
                  {t("Filter person", "按付款人筛选")}
                </label>
                <select
                  id="person-filter"
                  value={person}
                  onChange={(e) => setPerson(e.target.value)}
                >
                  <option value="all">{t("All people", "所有人")}</option>
                  {travellers.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.displayName}
                    </option>
                  ))}
                </select>
                <label className="sr-only" htmlFor="currency-filter">
                  {t("Filter currency", "按币种筛选")}
                </label>
                <select
                  id="currency-filter"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                >
                  <option value="all">{t("All currencies", "全部币种")}</option>
                  {["JPY", "NZD", "CNY"].map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
                <span className="muted">
                  {filtered.length} {t("expenses", "笔支出")}
                </span>
              </div>
              <div className="panel expense-list">
                {filtered.map((e) => {
                  const cat = categories.find((c) => c.id === e.category)!;
                  return (
                    <article className="expense-row" key={e.id}>
                      <time>
                        {dateLabel(e.date, lang, {
                          month: "short",
                          day: "numeric",
                        })}
                      </time>
                      <div className="expense-category-icon">
                        <cat.icon size={21} />
                      </div>
                      <div className="expense-description">
                        <strong>{e.description}</strong>
                        <span>
                          {t(cat.en, cat.zh)}
                          {e.note && " · " + e.note}
                        </span>
                      </div>
                      <span
                        className="person-badge"
                        style={{
                          background: travellers.find((p) => p.id === e.paidBy)
                            ?.color,
                        }}
                      >
                        {name(e.paidBy)}
                      </span>
                      <div className="expense-amount">
                        <strong>{money(e.amount, e.currency, lang)}</strong>
                        <small>{e.currency}</small>
                      </div>
                      <div className="expense-actions">
                        <button
                          className="icon-button"
                          aria-label={t("Edit ", "编辑 ") + e.description}
                          onClick={() => setEditing(e)}
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          className="icon-button"
                          aria-label={t("Delete ", "删除 ") + e.description}
                          onClick={() => setDeleteId(e.id)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      {deleteId === e.id && (
                        <div className="delete-confirm">
                          <span>
                            {t("Delete this expense?", "删除这笔支出？")}
                          </span>
                          <button
                            className="button small"
                            onClick={() => setDeleteId(undefined)}
                          >
                            {t("Cancel", "取消")}
                          </button>
                          <button
                            className="button danger small"
                            onClick={() => remove(e.id)}
                          >
                            {t("Delete", "删除")}
                          </button>
                        </div>
                      )}
                    </article>
                  );
                })}
                {!filtered.length && (
                  <EmptyState
                    icon={<Wallet size={30} />}
                    title={
                      expenses.length
                        ? t("No matching expenses", "没有符合条件的支出")
                        : t(
                            "Every adventure starts fresh",
                            "每段旅程，从这里开始",
                          )
                    }
                  >
                    <p>
                      {t(
                        "Record actual spending as you go. Your first expense will appear here.",
                        "随手记录实际花费，你的第一笔支出会出现在这里。",
                      )}
                    </p>
                    {!expenses.length && (
                      <button
                        className="button primary"
                        onClick={() => setEditing(null)}
                      >
                        <Plus size={16} />
                        {t("Add your first expense", "添加第一笔支出")}
                      </button>
                    )}
                  </EmptyState>
                )}
              </div>
            </>
          )}
          {tab === "summary" && (
            <>
              <div className="currency-totals">
                {(["JPY", "NZD", "CNY"] as Currency[]).map((c) => (
                  <div className="soft-panel" key={c}>
                    <span className="eyebrow">
                      {c} · {t("ORIGINAL TOTAL", "原币金额")}
                    </span>
                    <h2>{money(summary.totals[c], c, lang)}</h2>
                  </div>
                ))}
              </div>
              <h2 className="section-title">{t("By traveller", "按旅行者")}</h2>
              <div className="balance-table">
                <div className="balance-head">
                  <span>{t("Traveller", "旅行者")}</span>
                  <span>{t("Paid", "已付")}</span>
                  <span>{t("Share owed", "应摊")}</span>
                  <span>{t("Net balance", "净额")}</span>
                </div>
                {summary.balances.map((b) => (
                  <div className="balance-row" key={b.id}>
                    <strong>{b.displayName}</strong>
                    <span>{money(b.paid)}</span>
                    <span>{money(b.owed)}</span>
                    <strong className={b.net > 0 ? "positive" : ""}>
                      {b.net > 0 ? "+" : ""}
                      {money(b.net)}
                    </strong>
                  </div>
                ))}
              </div>
              <p className="muted small-copy">
                {t(
                  "Positive balances receive money; negative balances pay. All figures above are in JPY.",
                  "正数表示应收，负数表示应付。以上金额均为日元。",
                )}
              </p>
            </>
          )}
          {tab === "split" && (
            <>
              <div className="section-heading">
                <h2>{t("A simple way to settle", "轻松结清")}</h2>
                <span>JPY</span>
              </div>
              <div className="panel settlement-list">
                {summary.settlements.map((s, i) => (
                  <div className="settlement-row" key={i}>
                    <span className="avatar">{name(s.from).slice(0, 1)}</span>
                    <strong>{name(s.from)}</strong>
                    <ArrowRight size={20} />
                    <strong>{name(s.to)}</strong>
                    <b>{money(s.amount)}</b>
                  </div>
                ))}
                {!summary.settlements.length && (
                  <EmptyState
                    icon={<Check size={28} />}
                    title={t("All square", "账目已平衡")}
                  >
                    <p>
                      {expenses.length
                        ? t("No transfers needed.", "无需转账。")
                        : t(
                            "Settlement suggestions will appear once you add shared expenses.",
                            "添加共同支出后，将显示结算建议。",
                          )}
                    </p>
                  </EmptyState>
                )}
              </div>
              <p className="muted small-copy">
                {t(
                  "Suggestions only. No payments are sent. Splits use the participants selected for each expense.",
                  "仅为建议，不会实际转账。结算按照每笔支出选择的参与者计算。",
                )}
              </p>
            </>
          )}
          <div className="expense-total">
            <div>
              <span>{t("Total trip spending", "旅行总支出")}</span>
              <small>
                {t("Converted to JPY · All expenses", "折合日元 · 所有支出")}
              </small>
            </div>
            <strong>
              {money(summary.total)} <small>JPY</small>
            </strong>
          </div>
          <p className="fx-note">
            {t("Manual planning rates", "手动参考汇率")}: 1 NZD = ¥
            {exchangeRates.rates.NZD} · 1 CNY = ¥{exchangeRates.rates.CNY}.{" "}
            {t(
              "Illustrative rates; confirm before settling.",
              "示例汇率，结算前请核实。",
            )}
          </p>
        </>
      )}
      {editing !== undefined && (
        <ExpenseForm
          expense={editing}
          onClose={() => setEditing(undefined)}
          onSaved={async () => {
            setEditing(undefined);
            await refresh();
          }}
        />
      )}
    </>
  );
}
function ExpenseForm({
  expense,
  onClose,
  onSaved,
}: {
  expense: Expense | null;
  onClose: () => void;
  onSaved: () => Promise<void>;
}) {
  const { t, travellers } = useApp();
  const dialog = useRef<HTMLDialogElement>(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [currency, setCurrency] = useState<Currency>(
    expense?.currency ?? "JPY",
  );
  const [participants, setParticipants] = useState(
    expense?.participantIds ?? travellers.map((t) => t.id),
  );
  useEffect(() => {
    const el = dialog.current;
    el?.showModal();
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      el?.close();
      document.body.style.overflow = previous;
    };
  }, []);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const f = new FormData(event.currentTarget);
    const amount = Number(f.get("amount"));
    if (!participants.length) {
      setError(t("Select at least one participant.", "请至少选择一位参与者。"));
      return;
    }
    if (!Number.isFinite(amount) || amount <= 0 || amount > 1e9) {
      setError(
        t(
          "Enter an amount between 0 and 1 billion.",
          "请输入大于0且不超过10亿的金额。",
        ),
      );
      return;
    }
    setSaving(true);
    const data: Expense = {
      id: expense?.id ?? crypto.randomUUID(),
      category: f.get("category") as ExpenseCategory,
      description: String(f.get("description")).trim(),
      amount,
      currency,
      paidBy: String(f.get("paidBy")),
      date: String(f.get("date")),
      participantIds: participants,
      note: String(f.get("note")).trim(),
    };
    if (!data.description) {
      setError(t("Add a description.", "请填写说明。"));
      setSaving(false);
      return;
    }
    try {
      await (expense
        ? expenseRepository.updateExpense(data)
        : expenseRepository.addExpense(data));
      await onSaved();
    } catch {
      setError(
        t(
          "Could not save. Your browser storage may be full or unavailable.",
          "保存失败，浏览器存储可能已满或不可用。",
        ),
      );
      setSaving(false);
    }
  }
  return (
    <dialog
      ref={dialog}
      className="expense-dialog"
      aria-labelledby="expense-title"
      onCancel={(e) => {
        e.preventDefault();
        if (!saving) onClose();
      }}
    >
      <form onSubmit={submit}>
        <div className="dialog-header">
          <div>
            <span className="eyebrow">JAPAN 2026</span>
            <h2 id="expense-title">
              {expense
                ? t("Edit expense", "编辑支出")
                : t("Add an expense", "添加支出")}
            </h2>
          </div>
          <button
            type="button"
            disabled={saving}
            className="icon-button"
            aria-label={t("Close", "关闭")}
            onClick={onClose}
          >
            <X size={22} />
          </button>
        </div>
        <label>
          {t("Description", "说明")}
          <input
            name="description"
            required
            maxLength={120}
            defaultValue={expense?.description}
            placeholder={t(
              "e.g. Lunch at Sankaku Market",
              "例如：三角市场午餐",
            )}
            autoFocus
          />
        </label>
        <div className="form-row">
          <label>
            {t("Amount", "金额")}
            <input
              name="amount"
              type="number"
              inputMode="decimal"
              required
              min={currency === "JPY" ? 1 : 0.01}
              max={1e9}
              step={1 / 10 ** currencyDigits(currency)}
              defaultValue={expense?.amount}
              placeholder="0"
            />
          </label>
          <label>
            {t("Currency", "币种")}
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value as Currency)}
            >
              {["JPY", "NZD", "CNY"].map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
        </div>
        <div className="form-row">
          <label>
            {t("Category", "类别")}
            <select name="category" defaultValue={expense?.category ?? "food"}>
              {categories.map((c) => (
                <option value={c.id} key={c.id}>
                  {t(c.en, c.zh)}
                </option>
              ))}
            </select>
          </label>
          <label>
            {t("Date", "日期")}
            <input
              type="date"
              name="date"
              required
              defaultValue={expense?.date ?? japanDate()}
            />
          </label>
        </div>
        <label>
          {t("Paid by", "付款人")}
          <select
            name="paidBy"
            defaultValue={expense?.paidBy ?? travellers[0].id}
          >
            {travellers.map((p) => (
              <option key={p.id} value={p.id}>
                {p.displayName}
              </option>
            ))}
          </select>
        </label>
        <fieldset>
          <legend>{t("Split equally between", "平均分摊给")}</legend>
          <div className="participant-list">
            {travellers.map((p) => (
              <label key={p.id}>
                <input
                  type="checkbox"
                  checked={participants.includes(p.id)}
                  onChange={() =>
                    setParticipants((ids) =>
                      ids.includes(p.id)
                        ? ids.filter((i) => i !== p.id)
                        : [...ids, p.id],
                    )
                  }
                />
                {p.displayName}
              </label>
            ))}
          </div>
        </fieldset>
        <label>
          {t("Note (optional)", "备注（可选）")}
          <input name="note" maxLength={300} defaultValue={expense?.note} />
        </label>
        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
        <div className="dialog-footer">
          <button
            type="button"
            className="button"
            disabled={saving}
            onClick={onClose}
          >
            {t("Cancel", "取消")}
          </button>
          <button className="button primary" disabled={saving} type="submit">
            {saving ? t("Saving…", "保存中…") : t("Save expense", "保存支出")}
          </button>
        </div>
      </form>
    </dialog>
  );
}
