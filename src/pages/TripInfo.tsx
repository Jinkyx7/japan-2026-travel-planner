import { Link } from "react-router-dom";
import { flights } from "../data/flights";
import { dateLabel } from "../lib/trip";
import { useState, type FormEvent } from "react";
import { Users, Plane, Bus, Check, Info } from "lucide-react";
import { useApp } from "../components/AppContext";
import { PageHeading } from "../components/UI";
export function TripInfo() {
  const { t, lang, travellers, saveTravellers } = useApp();
  const [status, setStatus] = useState("");
  async function save(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    try {
      await saveTravellers(
        travellers.map((p) => ({
          ...p,
          displayName: String(data.get(p.id)).trim() || p.displayName,
        })),
      );
      setStatus(t("Names saved on this device.", "昵称已保存在此设备。"));
    } catch {
      setStatus(t("Could not save names.", "无法保存昵称。"));
    }
  }
  return (
    <>
      <PageHeading
        eyebrow={t("THE ESSENTIALS", "旅行必备")}
        title={t("Trip information", "旅行信息")}
        subtitle={t(
          "19–29 December 2026 · Hokkaido & Tokyo",
          "2026年12月19–29日 · 北海道与东京",
        )}
      />
      <div className="info-grid">
        <section className="panel info-card">
          <Plane size={24} />
          <h2>{t("Flights", "航班")}</h2>
          {flights.map((flight) => (
            <Link
              className="info-item flight-summary"
              key={flight.id}
              to={`/flights#${flight.id}`}
            >
              <span className="eyebrow">
                {dateLabel(flight.departure.date, lang)} · {flight.number}
              </span>
              <h3>
                {flight.departure.code} → {flight.arrival.code}
              </h3>
              <p>
                {flight.departure.time} → {flight.arrival.time} ·{" "}
                {t("airport local times", "机场当地时间")}
              </p>
            </Link>
          ))}
          <Link className="button primary" to="/flights">
            {t("Flight details & baggage", "航班详情与行李")}
          </Link>
          <Link className="button secondary" to="/accommodation">
            {t("Accommodation details", "住宿详情")}
          </Link>
        </section>
        <section className="panel info-card">
          <Bus size={24} />
          <h2>{t("Hotel shuttles", "酒店接驳")}</h2>
          <div className="info-item">
            <span className="eyebrow">DEC 20 · 15:00</span>
            <h3>{t("Sapporo Station → Hanamomiji", "札幌站 → 花红叶")}</h3>
            <p>
              {t(
                "Meet at JR Sapporo Station North Exit",
                "在 JR 札幌站北口集合",
              )}
            </p>
          </div>
          <div className="info-item">
            <span className="eyebrow">DEC 21 · 10:00</span>
            <h3>{t("Hanamomiji → Sapporo Station", "花红叶 → 札幌站")}</h3>
          </div>
          <span className="confirmed">
            <Check size={14} />
            {t("Both confirmed · 3 passengers", "均已确认 · 3位乘客")}
          </span>
        </section>
        <section className="panel info-card">
          <Users size={24} />
          <h2>{t("Our travellers", "我们的旅伴")}</h2>
          <p>
            {t(
              "Use nicknames so the trip stays personal and private.",
              "使用昵称，让旅程亲切又私密。",
            )}
          </p>
          <form onSubmit={save} className="traveller-form">
            {travellers.map((p, i) => (
              <label key={p.id}>
                {t(`Traveller ${i + 1}`, `旅行者 ${i + 1}`)}
                <input
                  name={p.id}
                  defaultValue={p.displayName}
                  required
                  maxLength={30}
                />
              </label>
            ))}
            <button className="button primary" type="submit">
              {t("Save names", "保存昵称")}
            </button>
            <p role="status">{status}</p>
          </form>
        </section>
        <section className="soft-panel info-card">
          <Info size={24} />
          <h2>{t("A few useful things", "一些实用提醒")}</h2>
          <p>
            {t(
              "Your expenses, shopping checklist, notes and traveller names are saved in this browser on this device.",
              "支出、购物清单、笔记和旅伴昵称保存在当前设备的浏览器中。",
            )}
          </p>
          <p>
            {t(
              "Other family members will have their own local records. Clearing browser data removes saved records.",
              "其他家人使用各自的本地记录。清除浏览器数据会删除保存的记录。",
            )}
          </p>
          <p>
            {t(
              "Daily itinerary and accommodation times are in Japan time. Flight times use each airport’s local time. Recheck schedules before travel.",
              "每日行程与住宿时间为日本时间；航班采用各机场当地时间。出发前请核实最新班次。",
            )}
          </p>
          <p>
            {t(
              "Tokyo sightseeing remains open; the 29 December departure is recorded.",
              "东京观光安排暂留空白；已记录12月29日离境航班。",
            )}
          </p>
        </section>
      </div>
    </>
  );
}
