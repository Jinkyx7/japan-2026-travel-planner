import { useApp } from "./AppContext";
import { expenseTargets } from "../lib/expenseLinks";
import { itinerary } from "../data/itinerary";
import { dateLabel } from "../lib/trip";

export function ExpenseTargetOptions() {
  const { t, lang } = useApp();
  return (
    <>
      <optgroup label={t("Accommodation", "住宿")}>
        {expenseTargets
          .filter((target) => target.kind === "stay")
          .map((target) => (
            <option key={target.id} value={target.id}>
              {dateLabel(target.date, lang, { month: "short", day: "numeric" })}{" "}
              · {target.title[lang]}
            </option>
          ))}
      </optgroup>
      {itinerary.map((day) => {
        const targets = expenseTargets.filter(
          (target) => target.dayId === day.id,
        );
        return targets.length ? (
          <optgroup
            key={day.id}
            label={`${dateLabel(day.date, lang, { month: "short", day: "numeric" })} · ${day.name[lang]}`}
          >
            {targets.map((target) => (
              <option key={target.id} value={target.id}>
                {target.title[lang]}
              </option>
            ))}
          </optgroup>
        ) : null;
      })}
    </>
  );
}
