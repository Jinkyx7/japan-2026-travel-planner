import { useState } from "react";
import { Utensils, ArrowUpRight, Coffee } from "lucide-react";
import { useApp } from "../components/AppContext";
import { PageHeading, PlaceName, EmptyState, MapsLink } from "../components/UI";
import { PlaceMap } from "../components/PlaceMap";
import { places } from "../data/places";
import { restaurants } from "../data/restaurants";
import { areaNames } from "../data/trip";
import type { Area } from "../types";
export function AreaFilter({
  area,
  setArea,
}: {
  area: string;
  setArea: (a: string) => void;
}) {
  const { t } = useApp();
  return (
    <div className="chips">
      {["All", ...Object.keys(areaNames)].map((a) => (
        <button
          key={a}
          aria-pressed={area === a}
          className={area === a ? "active" : ""}
          onClick={() => setArea(a)}
        >
          {a === "All"
            ? t("All places", "全部地区")
            : t(a, areaNames[a as Area])}
        </button>
      ))}
    </div>
  );
}
export function FoodCards({ area = "All" }: { area?: string }) {
  const { lang, t } = useApp();
  const filtered = restaurants.filter(
    (r) => area === "All" || places[r.placeId].area === area,
  );
  return (
    <div className="food-grid">
      {filtered.map((r) => {
        const p = places[r.placeId];
        return (
          <article key={r.id} className="restaurant-card">
            <div className={"food-symbol food-" + r.id}>
              {r.id === "letao" ? (
                <Coffee size={30} strokeWidth={1.3} />
              ) : (
                <Utensils size={30} strokeWidth={1.3} />
              )}
            </div>
            <div className="restaurant-content">
              <div className="restaurant-title">
                <div>
                  <PlaceName place={p} />
                </div>
                <span className="tiny-tag">
                  {r.choice === "primary"
                    ? t("On our list", "首选")
                    : t("Another option", "备选")}
                </span>
              </div>
              <p>{r.dish[lang]}</p>
              <div className="restaurant-meta">
                <span>{t(p.area, areaNames[p.area])}</span>
                <span>·</span>
                <span>{r.meal[lang]}</span>
              </div>
              <p className="price-note">
                {r.price ??
                  t("Check current menu for prices", "价格请查看最新菜单")}
              </p>
              <div className="restaurant-links">
                <MapsLink place={p} />
                {p.website && (
                  <a
                    className="text-link"
                    href={p.website}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {t("Website", "官网")}
                    <ArrowUpRight size={14} />
                  </a>
                )}
              </div>
            </div>
          </article>
        );
      })}
      {!filtered.length && (
        <EmptyState
          icon={<Utensils size={26} />}
          title={t("Good food is still to be found", "美味等待发现")}
        >
          <p>
            {t(
              "No restaurants have been added for this area yet.",
              "此地区尚未添加餐厅。",
            )}
          </p>
        </EmptyState>
      )}
    </div>
  );
}
export function Food() {
  const { t } = useApp();
  const [area, setArea] = useState("All");
  const points = restaurants
    .filter((r) => area === "All" || places[r.placeId].area === area)
    .map((r) => places[r.placeId]);
  return (
    <>
      <PageHeading
        eyebrow={t("GOOD FOOD. GOOD COMPANY.", "美食与相聚。")}
        title={t("Food & restaurants", "美食与餐厅")}
        subtitle={t(
          "A few delicious stops along the way.",
          "旅途中，值得停下来的美味。",
        )}
      />
      <AreaFilter area={area} setArea={setArea} />
      <PlaceMap places={points} numbered={false} />
      <div className="section-heading">
        <h2>{t("Something to look forward to", "值得期待的美味")}</h2>
        <span>
          {points.length} {t("PLACES", "个地点")}
        </span>
      </div>
      <FoodCards area={area} />
    </>
  );
}
export function MapPage() {
  const { t } = useApp();
  const [area, setArea] = useState("Sapporo");
  const points = Object.values(places).filter(
    (p) => p.id !== "pvg" && (area === "All" || p.area === area),
  );
  return (
    <>
      <PageHeading
        eyebrow={t("A SENSE OF PLACE", "找到旅行的方向")}
        title={t("Explore the map", "探索地图")}
        subtitle={t(
          "Our stops, stays, and small discoveries.",
          "我们的景点、住宿与小小发现。",
        )}
      />
      <AreaFilter area={area} setArea={setArea} />
      <PlaceMap places={points} />
      <div className="place-grid">
        {points.map((p, i) => (
          <article className="place-row" key={p.id}>
            <span className="pin-number">{i + 1}</span>
            <div>
              <PlaceName place={p} all />
            </div>
            <MapsLink place={p} />
          </article>
        ))}
      </div>
    </>
  );
}
