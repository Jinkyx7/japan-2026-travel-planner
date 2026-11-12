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
import { stopPhoto } from "../data/stopPhoto";
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
  const photo = stopPhoto(day, item);
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
      <div className="stop-photo">
        <img src={photo.src} alt={photo.alt} />
        {photo.areaView && <span>{t("Area view", "周边景观")}</span>}
      </div>
      <div className="day-meta">
        <span>
          <CalendarDays size={17} />
          {dateLabel(day.date, lang)}
        </span>
        <span>
          {item.timeLabel?.[lang] ??
            item.time ??
            t("Flexible timing", "时间灵活安排")}
        </span>
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
            {!item.transferSteps && accommodationByPlace[place.id] && (
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
        {item.relatedPlaceIds && (
          <div className="stop-section">
            <h2>{t("Along the way", "沿途地点")}</h2>
            {item.relatedPlaceIds.map((id) => (
              <div key={id} className="related-stop">
                <PlaceName place={places[id]} all />
                <MapsLink place={places[id]} />
              </div>
            ))}
          </div>
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
        {item.transferSteps && (
          <div className="stop-section">
            <h2>{t("Step-by-step transfer", "交通步骤")}</h2>
            <ol className="transfer-steps">
              {item.transferSteps.map((step, index) => (
                <li key={index}>{step[lang]}</li>
              ))}
            </ol>
            <div className="transfer-sources">
              {item.transportSources?.map((source) => (
                <a
                  key={source.url}
                  className="text-link"
                  href={source.url}
                  target="_blank"
                  rel="noreferrer"
                >
                  {source.label}
                  <ArrowUpRight size={14} />
                </a>
              ))}
            </div>
          </div>
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
            {transport.confirmed ? (
              <p className="map-help">
                {t(
                  "Reserved hotel shuttle: follow the meeting instructions in your booking.",
                  "预约酒店接驳：请按预订中的集合指引乘车。",
                )}
              </p>
            ) : (
              <>
                {["susukino", "ikebukuro"].some((id) =>
                  [transport.originId, transport.destinationId].includes(id),
                ) && (
                  <p className="map-help">
                    {t(
                      "Directions use Susukino / Ikebukuro Station as the public reference for your stay. Enter your private booking address for the final leg.",
                      "住宿导航以薄野站／池袋站为公开参考点；最后一段请填写预订中的准确地址。",
                    )}
                  </p>
                )}
                <a
                  className="text-link"
                  href={directionsUrl(
                    places[transport.originId],
                    places[transport.destinationId],
                    item.kind === "walk" ? "walking" : "transit",
                  )}
                  target="_blank"
                  rel="noreferrer"
                >
                  {t("Open directions", "查看路线")}
                  <ArrowUpRight size={14} />
                </a>
              </>
            )}
          </div>
        )}
      </section>
    </>
  );
}
