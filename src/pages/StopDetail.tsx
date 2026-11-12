import { Link, useParams, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowUpRight,
  BedDouble,
  CalendarDays,
  MapPin,
} from "lucide-react";
import { useApp } from "../components/AppContext";
import { EmptyState, MapsLink, PlaceName } from "../components/UI";
import { itinerary } from "../data/itinerary";
import { places } from "../data/places";
import { dateLabel } from "../lib/trip";
import { directionsUrl } from "../services/mapService";
import { accommodationByPlace } from "../data/accommodations";
import { flightById } from "../data/flights";
import { StayDetails, FlightCard } from "../components/BookingDetails";
export function StopDetail() {
  const { dayId, itemId } = useParams();
  const [searchParams] = useSearchParams();
  const { t, lang } = useApp();
  const day = itinerary.find((d) => d.id === dayId);
  const item = day?.items.find((i) => i.id === itemId);
  if (!day || !item)
    return (
      <EmptyState title={t("Stop not found", "未找到行程地点")}>
        <Link to="/itinerary">{t("Back to itinerary", "返回行程")}</Link>
      </EmptyState>
    );
  const place = item.placeId ? places[item.placeId] : undefined;
  const transport = item.transport;
  return (
    <>
      <Link
        className="back-link"
        to={`/itinerary/${day.id}${searchParams.get("plan") === "B" || item.plan === "B" ? "?plan=B" : ""}`}
      >
        <ArrowLeft size={16} />
        {t("Back to the day", "返回当天行程")}
      </Link>
      <header className="page-heading">
        <div>
          <div className="eyebrow">
            {t(
              `DAY ${itinerary.indexOf(day) + 1} · STOP DETAILS`,
              `第${itinerary.indexOf(day) + 1}天 · 行程详情`,
            )}
          </div>
          <h1>{item.title[lang]}</h1>
        </div>
      </header>
      <div className="day-meta">
        <span>
          <CalendarDays size={17} />
          {dateLabel(day.date, lang)}
        </span>
        <span>{item.time ?? t("Flexible timing", "时间灵活安排")}</span>
      </div>
      <section className="stop-detail-panel">
        {place ? (
          <>
            <div className="stop-place-heading">
              {place.category === "hotel" ? (
                <BedDouble size={28} />
              ) : (
                <MapPin size={28} />
              )}
              <div>
                <span className="eyebrow">
                  {place.category === "hotel"
                    ? t("ACCOMMODATION", "住宿")
                    : t("THE PLACE", "地点")}
                </span>
                <PlaceName place={place} all />
              </div>
            </div>
            {place.notes && <p>{place.notes[lang]}</p>}
            {accommodationByPlace[place.id] && (
              <StayDetails stay={accommodationByPlace[place.id]} />
            )}
            <div className="restaurant-links">
              <MapsLink place={place} />
              {place.website && (
                <a
                  className="text-link"
                  href={place.website}
                  target="_blank"
                  rel="noreferrer"
                >
                  {t("Website", "官网")}
                  <ArrowUpRight size={14} />
                </a>
              )}
            </div>
          </>
        ) : (
          <p>
            {t(
              "The exact location has not been added yet.",
              "具体地点尚未添加。",
            )}
          </p>
        )}
        {item.note && (
          <div className="stop-section">
            <h2>{t("The plan", "行程安排")}</h2>
            <p>{item.note[lang]}</p>
          </div>
        )}
        {item.flightId && flightById[item.flightId] && (
          <FlightCard flight={flightById[item.flightId]} />
        )}
        {transport && !item.flightId && (
          <div className="stop-section">
            <h2>{t("Getting there", "交通安排")}</h2>
            <PlaceName place={places[transport.originId]} all />
            <p>↓</p>
            <PlaceName place={places[transport.destinationId]} all />
            <p>
              {transport.duration} {transport.price}
            </p>
            {transport.confirmed && (
              <p className="confirmed">
                {t("Confirmed", "已确认")} · {transport.passengers}{" "}
                {t("passengers", "人")}
              </p>
            )}
            <a
              className="text-link"
              href={directionsUrl(
                places[transport.originId],
                places[transport.destinationId],
              )}
              target="_blank"
              rel="noreferrer"
            >
              {t("Open directions", "查看路线")}
              <ArrowUpRight size={14} />
            </a>
          </div>
        )}
      </section>
    </>
  );
}
