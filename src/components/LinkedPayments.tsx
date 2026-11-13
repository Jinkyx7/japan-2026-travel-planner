import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, Wallet, Plus, ArrowUpRight } from "lucide-react";
import { useAuth } from "./AuthContext";
import { useApp } from "./AppContext";
import { expenseRepository } from "../services/expenses";
import {
  addLinkedExpenseUrl,
  getExpenseTarget,
  linkedExpensesUrl,
  linkedPaymentSummary,
} from "../lib/expenseLinks";
import { money } from "../lib/expenses";
import { dateLabel } from "../lib/trip";
import type { Currency, Expense } from "../types";

export function useLinkedExpenses(targetIds: string[]) {
  const { session, member, loading: authLoading, error: authError } = useAuth();
  const identity =
    session && member && !authLoading && !authError
      ? `${session.user.id}:${session.user.email}`
      : "";
  const targets = JSON.stringify([...new Set(targetIds)].sort());
  const key = identity ? `${identity}|${targets}` : "";
  const [revision, setRevision] = useState(0);
  const [result, setResult] = useState<{
    key: string;
    expenses: Expense[];
    error: boolean;
    loading: boolean;
  } | null>(null);
  useEffect(() => {
    if (!key) {
      setResult(null);
      return;
    }
    let active = true;
    let request = 0;
    async function load() {
      const serial = ++request;
      setResult({ key, expenses: [], error: false, loading: true });
      try {
        const expenses = await expenseRepository.getLinkedExpenses(
          JSON.parse(targets),
        );
        if (active && serial === request)
          setResult({ key, expenses, error: false, loading: false });
      } catch {
        if (active && serial === request)
          setResult({ key, expenses: [], error: true, loading: false });
      }
    }
    function offline() {
      request++;
      setResult({ key, expenses: [], error: true, loading: false });
    }
    void load();
    window.addEventListener("focus", load);
    window.addEventListener("online", load);
    window.addEventListener("offline", offline);
    return () => {
      active = false;
      window.removeEventListener("focus", load);
      window.removeEventListener("online", load);
      window.removeEventListener("offline", offline);
    };
  }, [key, targets, revision]);
  const current = key && result?.key === key ? result : null;
  return {
    expenses: current?.expenses ?? [],
    error: current?.error ?? false,
    loading: !!key && (!current || current.loading),
    refresh: () => setRevision((n) => n + 1),
  };
}

export function PaymentBadge({
  targetId,
  expenses,
}: {
  targetId: string;
  expenses: Expense[];
}) {
  const { member, loading, error } = useAuth();
  const { t, travellers, travellersReady } = useApp();
  const summary = linkedPaymentSummary(expenses, targetId);
  if (
    !member ||
    loading ||
    error ||
    !travellersReady ||
    !summary.payments.length
  )
    return null;
  const names = summary.payerIds.map(
    (id) =>
      travellers.find((person) => person.id === id)?.displayName ??
      t("Trip member", "旅行成员"),
  );
  return (
    <span
      className={`payment-badge ${summary.status === "paid" ? "is-paid" : ""}`}
    >
      {summary.status === "paid" ? (
        <CheckCircle2 size={14} />
      ) : (
        <Wallet size={14} />
      )}
      {summary.status === "paid"
        ? t("Paid in full", "已付清")
        : t("Payment recorded", "已记录付款")}{" "}
      · {names.join(" / ")}
    </span>
  );
}

export function LinkedPaymentDetails({ targetId }: { targetId: string }) {
  const { member, session, loading, error } = useAuth();
  if (!member || !session || loading || error) return null;
  return (
    <MemberPaymentDetails
      key={`${session.user.id}:${targetId}`}
      targetId={targetId}
    />
  );
}
function MemberPaymentDetails({ targetId }: { targetId: string }) {
  const { t, lang, travellers } = useApp();
  const { expenses, error, loading, refresh } = useLinkedExpenses([targetId]);
  const target = getExpenseTarget(targetId);
  if (!target) return null;
  const summary = linkedPaymentSummary(expenses, targetId);
  return (
    <section
      className="linked-payments"
      aria-label={t("Linked payments", "关联支出")}
    >
      <header>
        <div>
          <span className="eyebrow">{t("MEMBERS ONLY", "仅旅行成员可见")}</span>
          <h2>{t("Linked payments", "关联支出")}</h2>
          <p>{target.title[lang]}</p>
        </div>
        {!loading && !error && (
          <PaymentBadge targetId={targetId} expenses={expenses} />
        )}
      </header>
      {loading ? (
        <p role="status">{t("Loading payments…", "正在读取付款记录…")}</p>
      ) : error ? (
        <p role="alert">
          {t(
            "Couldn't load payments. Reconnect and try again.",
            "无法读取付款记录，请联网后重试。",
          )}{" "}
          <button className="text-link" onClick={refresh}>
            {t("Try again", "重试")}
          </button>
        </p>
      ) : (
        <>
          {summary.payments.length ? (
            <>
              <div className="linked-payment-totals">
                {(Object.entries(summary.totals) as [Currency, number][]).map(
                  ([currency, amount]) => (
                    <strong key={currency}>
                      {money(amount, currency, lang)} {currency}
                    </strong>
                  ),
                )}
              </div>
              <ul className="linked-payment-list">
                {summary.payments.map((payment) => (
                  <li key={payment.id}>
                    <div>
                      <Link to={linkedExpensesUrl(targetId)}>
                        {payment.description}
                      </Link>
                      <small>
                        {dateLabel(payment.date, lang)} ·{" "}
                        {t("Paid by", "付款人")}{" "}
                        {travellers.find(
                          (person) => person.id === payment.paidBy,
                        )?.displayName ?? t("Trip member", "旅行成员")}
                        {payment.itemPaidInFull
                          ? ` · ${t("Completes payment", "已标记付清")}`
                          : ""}
                      </small>
                    </div>
                    <strong>
                      {money(payment.amount, payment.currency, lang)}{" "}
                      {payment.currency}
                    </strong>
                  </li>
                ))}
              </ul>
              {summary.status !== "paid" && (
                <p className="muted small-copy">
                  {t(
                    "Payments are recorded; this item hasn't been marked paid in full.",
                    "已有付款记录，尚未标记此项目已付清。",
                  )}
                </p>
              )}
            </>
          ) : (
            <p>
              {t("No payments have been linked yet.", "尚未关联付款记录。")}
            </p>
          )}
          <div className="linked-payment-actions">
            <Link className="button small" to={addLinkedExpenseUrl(targetId)}>
              <Plus size={15} />
              {t("Record payment", "记录付款")}
            </Link>
            {summary.payments.length > 0 && (
              <Link className="text-link" to={linkedExpensesUrl(targetId)}>
                {t("View / edit expenses", "查看／编辑账目")}
                <ArrowUpRight size={15} />
              </Link>
            )}
          </div>
        </>
      )}
    </section>
  );
}
