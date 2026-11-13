import { useApp } from "./AppContext";
import { dateLabel } from "../lib/trip";
import type { Accommodation } from "../data/accommodations";
import type { Flight } from "../data/flights";
import { LinkedPaymentDetails } from "./LinkedPayments";
import { stayExpenseId } from "../lib/expenseLinks";
export function StayDetails({ stay }: { stay: Accommodation }) {
  const { t, lang } = useApp();
  return (
    <div className="booking-details">
      <div className="booking-times">
        <div>
          <span>{t("Check-in", "入住")}</span>
          <strong>{stay.checkIn[lang]}</strong>
          <small>{dateLabel(stay.checkInDate, lang)}</small>
        </div>
        <div>
          <span>{t("Check out by", "最晚退房")}</span>
          <strong>{stay.checkOut}</strong>
          <small>{dateLabel(stay.checkOutDate, lang)}</small>
        </div>
      </div>
      <p className="booking-time-note">
        {t(
          "All accommodation times are local Japan time (JST).",
          "住宿时间均为日本当地时间（JST）。",
        )}
      </p>
      <dl className="booking-facts">
        {[
          [t("Room", "房型"), stay.room[lang]],
          [t("Beds", "床铺"), stay.beds[lang]],
          [t("Guests", "住客"), stay.guests[lang]],
          [t("Meals", "餐食"), stay.meals[lang]],
          [t("Facilities", "设施"), stay.amenities[lang]],
          [t("Booking payment terms", "预订付款说明"), stay.payment[lang]],
        ].map(([label, value]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
      <div className="stop-section">
        <h2>{t("Arrival & check-in", "抵达与入住")}</h2>
        <ul className="booking-notes">
          {stay.arrival.map((note, i) => (
            <li key={i}>{note[lang]}</li>
          ))}
        </ul>
      </div>
      {stay.notices.length > 0 && (
        <div className="booking-notice">
          <h3>{t("Before you arrive", "抵达前确认")}</h3>
          {stay.notices.map((note, i) => (
            <p key={i}>{note[lang]}</p>
          ))}
        </div>
      )}
      <LinkedPaymentDetails targetId={stayExpenseId(stay)} />
    </div>
  );
}
export function FlightCard({ flight }: { flight: Flight }) {
  const { t, lang } = useApp();
  return (
    <article id={flight.id} className="flight-card panel">
      <header className="flight-card-heading">
        <h2>{flight.number}</h2>
        <span>{flight.airline[lang]}</span>
      </header>
      <div className="flight-route">
        {[flight.departure, flight.arrival].map((point, i) => (
          <div key={i}>
            <span className="eyebrow">
              {i === 0 ? t("DEPARTURE", "出发") : t("ARRIVAL", "抵达")}
            </span>
            <strong>
              {point.time} <span>{point.code}</span>
            </strong>
            <span>
              {dateLabel(point.date, lang, {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </span>
            <span>
              {point.city[lang]} · {point.terminal[lang]}
            </span>
            <small>{point.zone}</small>
          </div>
        ))}
      </div>
      {flight.yearInferred && (
        <p className="booking-notice">
          {t(
            "Confirm year: the document prints 9/10 January without a year. 2027 is inferred from the trip sequence.",
            "请确认年份：文件仅注明1月9/10日，未印出年份；此处根据旅行顺序推定为2027年。",
          )}
        </p>
      )}
      <details className="flight-more">
        <summary>{t("Baggage & travel notes", "行李与出行提示")}</summary>
        <h3>{t("Baggage", "行李")}</h3>
        <ul className="booking-notes">
          {flight.baggage.map((note, i) => (
            <li key={i}>{note[lang]}</li>
          ))}
        </ul>
        <h3>{t("Travel notes", "出行提示")}</h3>
        {flight.notes.map((note, i) => (
          <p key={i}>{note[lang]}</p>
        ))}
      </details>
    </article>
  );
}
