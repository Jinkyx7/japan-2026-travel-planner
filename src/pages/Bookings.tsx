import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, BedDouble } from "lucide-react";
import { useApp } from "../components/AppContext";
import { PageHeading, PlaceName, MapsLink, EmptyState } from "../components/UI";
import { StayDetails, FlightCard } from "../components/BookingDetails";
import { accommodations, accommodationByPlace } from "../data/accommodations";
import { flights } from "../data/flights";
import { places } from "../data/places";
import { dateLabel } from "../lib/trip";
export function Accommodations() {
  const { t, lang } = useApp();
  return (
    <>
      <PageHeading
        eyebrow={t("A PLACE TO REST", "旅途中的落脚点")}
        title={t("Our stays", "住宿安排")}
        subtitle={t(
          "Check-in times, rooms and arrival notes from your confirmations.",
          "预订确认单中的入住时间、房型与抵达提示。",
        )}
      />
      <div className="stay-list">
        {accommodations.map((stay) => (
          <Link
            className="stay-card panel"
            to={`/accommodation/${stay.placeId}`}
            key={stay.placeId}
          >
            <BedDouble size={24} />
            <div>
              <PlaceName place={places[stay.placeId]} />
              <p>
                {dateLabel(stay.checkInDate, lang)} →{" "}
                {dateLabel(stay.checkOutDate, lang)}
              </p>
              <p>{stay.room[lang]}</p>
            </div>
            <ArrowRight size={18} />
          </Link>
        ))}
      </div>
    </>
  );
}
export function AccommodationDetail() {
  const { placeId } = useParams();
  const { t, lang } = useApp();
  const stay = accommodationByPlace[placeId ?? ""];
  if (!stay)
    return (
      <EmptyState title={t("Stay not found", "未找到住宿")}>
        <Link to="/accommodation">{t("All stays", "全部住宿")}</Link>
      </EmptyState>
    );
  const place = places[stay.placeId];
  return (
    <>
      <Link className="back-link" to="/accommodation">
        <ArrowLeft size={16} />
        {t("All stays", "全部住宿")}
      </Link>
      <PageHeading
        title={lang === "en" ? place.nameEn : place.nameZh}
        subtitle={place.nameJa}
      />
      <section className="panel accommodation-panel">
        <MapsLink place={place} />
        <StayDetails stay={stay} />
      </section>
    </>
  );
}
export function Flights() {
  const { t } = useApp();
  return (
    <>
      <PageHeading
        eyebrow={t("THE JOURNEY THERE & BACK", "出发与归途")}
        title={t("Flights", "航班安排")}
        subtitle={t(
          "17 Dec 2026 – 10 Jan 2027 · all flight times are local to the departure or arrival airport.",
          "2026年12月17日至2027年1月10日 · 航班时间均为起降机场当地时间。",
        )}
      />
      <p className="map-help">
        {t(
          "Schedules and allowances are copied from your booking documents, not a live flight feed. Check the latest airline booking before travel. January's year is inferred and needs confirmation.",
          "班次及行李额度依据所提供预订文件，并非实时航班状态。出发前请查看航司最新预订；1月行程的年份为推定，待确认。",
        )}
      </p>
      <div className="flight-list">
        {flights.map((flight) => (
          <FlightCard key={flight.id} flight={flight} />
        ))}
      </div>
    </>
  );
}
