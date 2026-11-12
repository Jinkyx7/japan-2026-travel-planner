import { useEffect, useRef, useState } from "react";
import { MapPin, ArrowUpRight, Utensils } from "lucide-react";
import type { Place } from "../types";
import { loadGoogleMaps } from "../services/mapService";
import { useApp } from "./AppContext";
import { MapsLink, PlaceName } from "./UI";
export function PlaceMap({
  places,
  numbered = true,
}: {
  places: Place[];
  numbered?: boolean;
}) {
  const { lang, t } = useApp();
  const ref = useRef<HTMLDivElement>(null);
  const [selected, setSelected] = useState<string>();
  const [state, setState] = useState<"loading" | "ready" | "fallback">(
    import.meta.env.VITE_GOOGLE_MAPS_API_KEY ? "loading" : "fallback",
  );
  const ids = places.map((p) => p.id).join(",");
  useEffect(() => {
    if (!import.meta.env.VITE_GOOGLE_MAPS_API_KEY) return;
    let disposed = false;
    let markers: google.maps.marker.AdvancedMarkerElement[] = [];
    const timer = setTimeout(() => {
      if (!disposed) setState("fallback");
    }, 12000);
    const authFail = () => {
      if (!disposed) setState("fallback");
    };
    window.addEventListener("japan-maps-auth-failure", authFail);
    loadGoogleMaps()
      .then(() => {
        if (disposed || !ref.current) return;
        const points = places.filter((p) => p.coordinates);
        const map = new google.maps.Map(ref.current, {
          center: points[0]?.coordinates ?? { lat: 43.06, lng: 141.35 },
          zoom: 12,
          mapId: import.meta.env.VITE_GOOGLE_MAPS_MAP_ID || "DEMO_MAP_ID",
          disableDefaultUI: true,
          zoomControl: true,
          gestureHandling: "cooperative",
        });
        const bounds = new google.maps.LatLngBounds();
        markers = points.map((p) => {
          bounds.extend(p.coordinates!);
          const food = p.category === "restaurant";
          const pin = document.createElement("div");
          pin.className = "place-marker" + (food ? " food-marker" : "");
          if (food) {
            pin.innerHTML =
              '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M4 3v5a3 3 0 0 0 6 0V3M7 3v19M20 22V3c-4 3-4 9 0 9"/></svg>';
          }
          if (numbered || !food) {
            const label = document.createElement("span");
            label.textContent = numbered
              ? String(places.findIndex((place) => place.id === p.id) + 1)
              : "•";
            pin.append(label);
          }
          const marker = new google.maps.marker.AdvancedMarkerElement({
            map,
            position: p.coordinates,
            title: `${food ? t("Food", "美食") : t("Stop", "地点")}: ${lang === "en" ? p.nameEn : p.nameZh}`,
            content: pin,
            zIndex: food ? 100 : 1,
          });
          marker.addListener("click", () => setSelected(p.id));
          return marker;
        });
        if (points.length > 1) map.fitBounds(bounds, 50);
        setState("ready");
        clearTimeout(timer);
      })
      .catch(() => {
        if (!disposed) setState("fallback");
      });
    return () => {
      disposed = true;
      clearTimeout(timer);
      markers.forEach((m) => (m.map = null));
      window.removeEventListener("japan-maps-auth-failure", authFail);
    }; // places are stable by their IDs
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ids, lang, numbered]);
  const current = places.find((p) => p.id === selected);
  return (
    <section className="map-panel" aria-label={t("Places map", "地点地图")}>
      <div
        ref={ref}
        className="google-map"
        style={{ display: state === "fallback" ? "none" : "block" }}
      />
      {state === "fallback" && (
        <div className="map-fallback">
          <div className="map-pattern" aria-hidden="true" />
          <div className="map-fallback-title">
            <div className="map-icon">
              <MapPin size={22} />
            </div>
            <h3>{t("Your places, all together", "想去的地方，都在这里")}</h3>
            <p>
              {t(
                "Open a stop in Google Maps to explore and get directions.",
                "在谷歌地图中打开地点，查看地图与路线。",
              )}
            </p>
          </div>
          <div className="map-stops">
            {places.map((p, i) => (
              <button
                key={p.id}
                className={selected === p.id ? "selected" : ""}
                onClick={() => setSelected(p.id)}
              >
                <span
                  className={
                    "pin-number" +
                    (p.category === "restaurant" ? " food-marker" : "")
                  }
                >
                  {p.category === "restaurant" && <Utensils size={13} />}
                  {numbered ? (
                    i + 1
                  ) : p.category !== "restaurant" ? (
                    <MapPin size={12} />
                  ) : null}
                </span>
                {lang === "en" ? p.nameEn : p.nameZh}
              </button>
            ))}
          </div>
          {!places.length && (
            <p>
              {t(
                "No places planned in this area yet.",
                "此地区暂无已规划地点。",
              )}
            </p>
          )}
        </div>
      )}
      {state === "loading" && (
        <div className="map-loading">{t("Loading map…", "正在加载地图…")}</div>
      )}
      {current && (
        <div className="map-place-card">
          <div>
            <span className="eyebrow">
              {t(
                current.category,
                {
                  attraction: "景点",
                  restaurant: "餐厅",
                  shopping: "购物",
                  hotel: "住宿",
                  station: "车站",
                  transport: "交通",
                  photo: "摄影",
                }[current.category],
              )}
            </span>
            <PlaceName place={current} />
            <p>
              {current.notes?.[lang] ??
                t("Save this stop for your journey.", "为旅程收藏这个地点。")}
            </p>
          </div>
          <MapsLink place={current} />
        </div>
      )}
      <div className="map-legend">
        <span>
          <MapPin size={15} />
          {t("Activities & other stops", "活动与其他地点")}
        </span>
        <span className="food-legend">
          <Utensils size={15} />
          {t("Food & cafés", "美食与咖啡")}
        </span>
      </div>
      <div className="map-caption">
        <span>
          <MapPin size={13} />
          {places.length} {t("places", "个地点")}
        </span>
        <a
          href={
            places[0]?.googleMapsUrl ??
            "https://www.google.com/maps/search/?api=1&query=Hokkaido+Japan"
          }
          target="_blank"
          rel="noreferrer"
        >
          {t("Open Google Maps", "打开谷歌地图")}
          <ArrowUpRight size={13} />
        </a>
      </div>
    </section>
  );
}
