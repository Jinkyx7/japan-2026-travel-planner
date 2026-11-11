import { useEffect, useState } from "react";
import { Check, ShoppingBag } from "lucide-react";
import { useApp } from "../components/AppContext";
import { PageHeading, Tabs, MapsLink } from "../components/UI";
import { shoppingItems } from "../data/shopping";
import { places } from "../data/places";
import { shoppingRepository } from "../services/storage";
export function Shopping() {
  const { t, lang } = useApp();
  const [view, setView] = useState("product");
  const [checked, setChecked] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(true);
  useEffect(() => {
    shoppingRepository
      .getChecked()
      .then(setChecked)
      .catch(() =>
        setError(t("Could not load the checklist.", "无法读取购物清单。")),
      )
      .finally(() => setBusy(false));
  }, [t]);
  async function toggle(id: string) {
    setBusy(true);
    const next = checked.includes(id)
      ? checked.filter((i) => i !== id)
      : [...checked, id];
    try {
      await shoppingRepository.setChecked(next);
      setChecked(next);
      setError("");
    } catch {
      setError(
        t(
          "Could not save. Check your browser storage.",
          "无法保存，请检查浏览器存储。",
        ),
      );
    } finally {
      setBusy(false);
    }
  }
  const groups =
    view === "product"
      ? [
          {
            id: "all",
            title: t("Little things to bring home", "把小小美好带回家"),
            items: shoppingItems,
          },
        ]
      : [...new Set(shoppingItems.flatMap((i) => i.recommendedPlaces))].map(
          (id) => ({
            id,
            title: lang === "en" ? places[id].nameEn : places[id].nameZh,
            items: shoppingItems.filter((i) =>
              i.recommendedPlaces.includes(id),
            ),
          }),
        );
  return (
    <>
      <PageHeading
        eyebrow={t("MEMORIES, WITH A LITTLE RIBBON", "给回忆系上蝴蝶结")}
        title={t("The shopping list", "购物清单")}
        subtitle={t(
          "Thoughtful souvenirs and a few treats for the journey home.",
          "用心挑选的纪念品，还有回家路上的小零食。",
        )}
        action={
          <span className="progress-pill">
            <ShoppingBag size={17} />
            {checked.length} / {shoppingItems.length} {t("packed", "已购")}
          </span>
        }
      />
      <div className="progress-track">
        <div
          style={{ width: `${(checked.length / shoppingItems.length) * 100}%` }}
        />
      </div>
      <Tabs
        value={view}
        onChange={setView}
        items={[
          { id: "product", label: t("By product", "按商品") },
          { id: "area", label: t("By area", "按地区") },
        ]}
      />
      {error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}
      <div className="shopping-groups">
        {groups.map((group) => (
          <section key={group.id}>
            <div className="section-heading">
              <h2>{group.title}</h2>
              {view === "area" && <MapsLink place={places[group.id]} />}
            </div>
            <div className="panel shopping-list">
              {group.items.map((item) => (
                <div
                  className={
                    "shopping-row " +
                    (checked.includes(item.id) ? "is-checked" : "")
                  }
                  key={item.id}
                >
                  <button
                    className="checkbox-button"
                    role="checkbox"
                    aria-checked={checked.includes(item.id)}
                    aria-label={lang === "en" ? item.nameEn : item.nameZh}
                    disabled={busy}
                    onClick={() => toggle(item.id)}
                  >
                    {checked.includes(item.id) && <Check size={16} />}
                  </button>
                  <div className="shopping-copy">
                    <h3>{lang === "en" ? item.nameEn : item.nameZh}</h3>
                    <span className="ja">{item.nameJa}</span>
                    <p>{item.notes[lang]}</p>
                    <div className="shopping-places">
                      {item.recommendedPlaces.map((id) => (
                        <a
                          key={id}
                          href={places[id].googleMapsUrl}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {lang === "en"
                            ? places[id].nameEn
                            : places[id].nameZh}
                        </a>
                      ))}
                    </div>
                  </div>
                  <span className="tiny-tag">{item.category[lang]}</span>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </>
  );
}
