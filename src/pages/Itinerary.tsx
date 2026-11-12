import { useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  MapPin,
  TrainFront,
  Bus,
  Plane,
  Footprints,
  Utensils,
  BedDouble,
  Check,
  NotebookPen,
  ChevronRight,
} from "lucide-react";
import { useApp } from "../components/AppContext";
import { PageHeading, Tabs, MapsLink, EmptyState } from "../components/UI";
import { PlaceMap } from "../components/PlaceMap";
import { FoodCards } from "./Places";
import { itinerary } from "../data/itinerary";
import { places } from "../data/places";
import { areaNames } from "../data/trip";
import { dateLabel } from "../lib/trip";
import { readStored, writeStored } from "../services/storage";
import { directionsUrl } from "../services/mapService";
import { destinationPhotos } from "../data/destinationPhotos";
import { dayMapPlaces } from "../lib/dayMap";
export function Itinerary() {
  const { t, lang } = useApp();
  const [region, setRegion] = useState("all");
  const days = itinerary.filter(
    (d) =>
      region === "all" ||
      (region === "tokyo" ? d.area === "Tokyo" : d.area !== "Tokyo"),
  );
  return (
    <>
      <PageHeading
        eyebrow={t(
          "ONE TRIP. COUNTLESS LITTLE MOMENTS.",
          "一段旅程，无数美好时刻。",
        )}
        title={t("The itinerary", "行程总览")}
        subtitle={t(
          "Hokkaido & Tokyo · 19–29 December · 11 days",
          "北海道与东京 · 12月19–29日 · 11天",
        )}
      />
      <div className="chips">
        {[
          ["all", "All days", "全部"],
          ["hokkaido", "Hokkaido", "北海道"],
          ["tokyo", "Tokyo", "东京"],
        ].map(([v, en, zh]) => (
          <button
            key={v}
            aria-pressed={region === v}
            className={region === v ? "active" : ""}
            onClick={() => setRegion(v)}
          >
            {t(en, zh)}
          </button>
        ))}
      </div>
      <div className="itinerary-list">
        {days.map((day) => (
          <Link
            className={"day-card " + (day.pending ? "pending" : "")}
            to={"/itinerary/" + day.id}
            key={day.id}
          >
            <div className="day-date">
              <span>DEC</span>
              <strong>{day.date.slice(-2)}</strong>
              <small>{dateLabel(day.date, lang, { weekday: "short" })}</small>
            </div>
            <div
              className={"day-art art-" + day.area.split(" ")[0].toLowerCase()}
            >
              <img
                src={destinationPhotos[day.area].src}
                alt={destinationPhotos[day.area].alt}
                loading="lazy"
              />
            </div>
            <div className="day-copy">
              <span className="eyebrow">
                {t(
                  `DAY ${itinerary.indexOf(day) + 1}`,
                  `第${itinerary.indexOf(day) + 1}天`,
                )}
              </span>
              <h3>
                {lang === "en" ? day.area : areaNames[day.area]}{" "}
                <span>{day.nameJa}</span>
              </h3>
              <p>{day.summary[lang]}</p>
            </div>
            <span className="day-tag">
              {day.pending
                ? t("To be planned", "待规划")
                : day.id === "dec-23"
                  ? t("Guided tour", "跟团游")
                  : day.id === "dec-24"
                    ? t("Plan A / B", "A / B 方案")
                    : day.name[lang]}
            </span>
            <ChevronRight size={19} />
          </Link>
        ))}
      </div>
    </>
  );
}
export function DayDetail() {
  const { dayId } = useParams();
  const day = itinerary.find((d) => d.id === dayId);
  if (!day)
    return (
      <EmptyState title="Day not found">
        <Link to="/itinerary">Back to itinerary</Link>
      </EmptyState>
    );
  return <DayContent key={day.id} day={day} />;
}
function DayContent({ day }: { day: (typeof itinerary)[number] }) {
  const { t, lang } = useApp();
  const [tab, setTab] = useState("timeline");
  const [searchParams, setSearchParams] = useSearchParams();
  const plan = searchParams.get("plan") === "B" ? "B" : "A";
  const setPlan = (value: string) =>
    setSearchParams({ plan: value }, { replace: true });
  const [note, setNote] = useState(() => {
    try {
      return readStored("note:" + day.id, "");
    } catch {
      return "";
    }
  });
  const [saved, setSaved] = useState("");
  const dayIndex = itinerary.indexOf(day);
  const items = day.items.filter((i) => !i.plan || i.plan === plan);
  const placeIds = [
    ...new Set(items.flatMap((i) => (i.placeId ? [i.placeId] : []))),
  ];
  const dayPlaces = dayMapPlaces(day, plan);
  return (
    <>
      <Link className="back-link" to="/itinerary">
        <ArrowLeft size={15} />
        {t("All days", "全部行程")}
      </Link>

      <section
        className="day-hero photo"
        style={{
          backgroundImage: `linear-gradient(0deg,rgba(17,35,43,.88),rgba(17,35,43,.12)),url(${destinationPhotos[day.area].src})`,
        }}
      >
        <div className="eyebrow">
          {t(`DAY ${dayIndex + 1}`, `第${dayIndex + 1}天`)} ·{" "}
          {dateLabel(day.date, lang)}
        </div>
        <h1>
          {lang === "en" ? day.area : areaNames[day.area]}{" "}
          <span>
            {[
              ...new Set([
                lang === "zh" ? day.area : areaNames[day.area],
                ...day.nameJa.split(" · "),
              ]),
            ].join(" · ")}
          </span>
        </h1>
        <p>
          {day.name[lang]} · {day.summary[lang]}
        </p>
      </section>
      <div className="day-meta day-overview">
        <div className="day-meta-details">
          <span>
            <CalendarDays size={16} />
            {dateLabel(day.date, lang, { month: "long", day: "numeric" })}
          </span>
          {day.accommodationId && (
            <Link
              className="stay-meta-link"
              to={`/accommodation/${day.accommodationId}`}
            >
              <BedDouble size={17} />
              {lang === "en"
                ? places[day.accommodationId].nameEn
                : places[day.accommodationId].nameZh}
              <ChevronRight size={14} />
            </Link>
          )}
          {day.id === "dec-24" && (
            <div className="plan-switch">
              {["A", "B"].map((p) => (
                <button
                  key={p}
                  aria-pressed={plan === p}
                  className={plan === p ? "active" : ""}
                  onClick={() => setPlan(p)}
                >
                  {t("Plan", "方案")} {p}
                </button>
              ))}
            </div>
          )}
        </div>
        <nav
          className="day-pagination day-pagination-top"
          aria-label={t("Day navigation", "日期导航")}
        >
          {dayIndex > 0 ? (
            <Link to={"/itinerary/" + itinerary[dayIndex - 1].id}>
              <ArrowLeft size={16} />
              {t("Previous day", "前一天")}
            </Link>
          ) : (
            <span />
          )}
          {dayIndex < itinerary.length - 1 && (
            <Link to={"/itinerary/" + itinerary[dayIndex + 1].id}>
              {t("Next day", "后一天")}
              <ArrowRight size={16} />
            </Link>
          )}
        </nav>
      </div>
      <Tabs
        value={tab}
        onChange={setTab}
        items={[
          ["timeline", "Timeline", "时间线"],
          ["map", "Map", "地图"],
          ["food", "Food", "美食"],
          ["notes", "Notes", "笔记"],
        ].map(([id, en, zh]) => ({ id, label: t(en, zh) }))}
      />
      <div className="day-body">
        {tab === "timeline" && (
          <div className="day-columns">
            <section className="timeline">
              {items.map((item) => {
                const Icon = {
                  train: TrainFront,
                  bus: Bus,
                  flight: Plane,
                  walk: Footprints,
                  food: Utensils,
                  stay: BedDouble,
                }[item.kind ?? "walk"];
                const place = item.placeId ? places[item.placeId] : undefined;
                return (
                  <article className="timeline-item" key={item.id}>
                    <div className="timeline-dot">
                      {place ? placeIds.indexOf(place.id) + 1 : <span />}
                    </div>
                    <time>{item.time ?? t("Flexible", "灵活")}</time>
                    <Icon
                      className="timeline-icon"
                      size={21}
                      strokeWidth={1.5}
                    />
                    <div className="timeline-content">
                      <h3>
                        <Link
                          className="stop-detail-link"
                          to={`/itinerary/${day.id}/stops/${item.id}?plan=${plan}`}
                        >
                          {item.title[lang]}
                          <ChevronRight size={16} />
                        </Link>
                      </h3>
                      {place && <span className="ja">{place.nameJa}</span>}
                      {item.note && <p>{item.note[lang]}</p>}
                      {item.transport && item.kind !== "flight" && (
                        <div className="transport-detail">
                          <p>
                            {lang === "en"
                              ? places[item.transport.originId].nameEn
                              : places[item.transport.originId].nameZh}{" "}
                            →{" "}
                            {lang === "en"
                              ? places[item.transport.destinationId].nameEn
                              : places[item.transport.destinationId].nameZh}
                          </p>
                          <span>
                            {item.transport.duration} {item.transport.price}
                          </span>
                          {item.transport.confirmed && (
                            <span className="confirmed">
                              <Check size={13} />
                              {t("Confirmed", "已确认")} ·{" "}
                              {item.transport.passengers}{" "}
                              {t("passengers", "人")}
                            </span>
                          )}
                          <a
                            className="text-link"
                            target="_blank"
                            rel="noreferrer"
                            href={directionsUrl(
                              places[item.transport.originId],
                              places[item.transport.destinationId],
                            )}
                          >
                            {t("Directions", "查看路线")}
                            <ArrowRight size={13} />
                          </a>
                        </div>
                      )}
                      {place && <MapsLink place={place} />}
                    </div>
                  </article>
                );
              })}
              {!items.length && (
                <EmptyState
                  icon={<NotebookPen size={28} />}
                  title={t("A day to make your own", "留给自由探索的一天")}
                >
                  <p>{day.note?.[lang]}</p>
                </EmptyState>
              )}
            </section>
            <aside className="day-sidebar">
              <div className="soft-panel">
                <MapPin size={21} />
                <h3>{t("A little note for the day", "今日小贴士")}</h3>
                <p>
                  {day.note?.[lang] ??
                    t(
                      "Leave a little space between stops. The best moments are often the ones in between.",
                      "行程之间留一点空白，最美好的时刻常常就在路上。",
                    )}
                </p>
                <button className="text-link" onClick={() => setTab("map")}>
                  {t("See places on the map", "查看今日地点")}
                  <ArrowRight size={15} />
                </button>
              </div>
            </aside>
          </div>
        )}
        {tab === "map" && (
          <>
            <p className="map-help">
              {t(
                "Numbered stops follow your timeline. Food options in this area are also shown; they are suggestions, not reservations.",
                "编号与时间线一致。同时显示本地区的美食备选，并非已预订餐厅。",
              )}
            </p>
            <PlaceMap places={dayPlaces} />
          </>
        )}
        {tab === "food" && <FoodCards area={day.area} />}{" "}
        {tab === "notes" && (
          <section className="notes-editor">
            <h2>{t("Little things to remember", "记下旅行的小事")}</h2>
            {day.note && <p>{day.note[lang]}</p>}
            <label htmlFor="day-notes">
              {t("Your notes for this day", "今日笔记")}
            </label>
            <textarea
              id="day-notes"
              value={note}
              onChange={(e) => {
                setNote(e.target.value);
                setSaved("");
              }}
              placeholder={t(
                "A meeting point, a café, something to remember…",
                "集合地点、咖啡馆，或值得记住的小事……",
              )}
            />
            <button
              className="button primary"
              onClick={() => {
                try {
                  writeStored("note:" + day.id, note);
                  setSaved(t("Saved on this device", "已保存在此设备"));
                } catch {
                  setSaved(
                    t(
                      "Could not save. Please check browser storage.",
                      "保存失败，请检查浏览器存储。",
                    ),
                  );
                }
              }}
            >
              {t("Save note", "保存笔记")}
            </button>
            <span role="status" className="save-status">
              {saved}
            </span>
          </section>
        )}
      </div>
      <nav
        className="day-pagination"
        aria-label={t("Day navigation at bottom", "底部日期导航")}
      >
        {dayIndex > 0 ? (
          <Link to={"/itinerary/" + itinerary[dayIndex - 1].id}>
            <ArrowLeft size={16} />
            {t("Previous day", "前一天")}
          </Link>
        ) : (
          <span />
        )}
        {dayIndex < itinerary.length - 1 && (
          <Link to={"/itinerary/" + itinerary[dayIndex + 1].id}>
            {t("Next day", "后一天")}
            <ArrowRight size={16} />
          </Link>
        )}
      </nav>
    </>
  );
}
