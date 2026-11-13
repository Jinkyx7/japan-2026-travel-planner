import { useEffect, useRef, useState } from "react";
import { MapPin, ArrowUpRight, Utensils } from "lucide-react";
import type { Place } from "../types";
import { loadGoogleMaps } from "../services/googleMapsLoader";
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
  const [initialized, setInitialized] = useState(0);
  const mapRef = useRef<google.maps.Map | null>(null);
  const boundsRef = useRef<google.maps.LatLngBounds | null>(null);
  const viewportKeyRef = useRef("");
  const markersRef = useRef(
    new Map<
      string,
      {
        marker: google.maps.marker.AdvancedMarkerElement;
        pin: HTMLDivElement;
        appearance: string;
        removeClickListener: () => void;
      }
    >(),
  );

  // Create once per mounted panel. React updates never run during pan/zoom.
  useEffect(() => {
    const root = ref.current;
    if (!root || !import.meta.env.VITE_GOOGLE_MAPS_API_KEY) return;
    let disposed = false;
    let authFailed = false;
    let map: google.maps.Map | undefined;
    let resize: ResizeObserver | undefined;
    let tilesListener: google.maps.MapsEventListener | undefined;
    let idleListener: google.maps.MapsEventListener | undefined;
    const markers = markersRef.current;
    const timer = window.setTimeout(() => {
      if (!disposed) setState("fallback");
    }, 20000);
    const authFail = () => {
      authFailed = true;
      window.clearTimeout(timer);
      if (!disposed) setState("fallback");
    };
    window.addEventListener("japan-maps-auth-failure", authFail);
    loadGoogleMaps()
      .then(() => {
        if (disposed || authFailed) return;
        map = new google.maps.Map(root, {
          center: { lat: 43.06, lng: 141.35 },
          zoom: 12,
          mapId: import.meta.env.VITE_GOOGLE_MAPS_MAP_ID || "DEMO_MAP_ID",
          disableDefaultUI: true,
          zoomControl: true,
          isFractionalZoomEnabled: true,
          tilt: 0,
          heading: 0,
          tiltInteractionEnabled: false,
          headingInteractionEnabled: false,
          // Direct wheel zoom on desktop; allow normal page scrolling on phones.
          gestureHandling: window.matchMedia("(pointer: coarse)").matches
            ? "cooperative"
            : "greedy",
        });
        mapRef.current = map;
        viewportKeyRef.current = "";
        tilesListener = map.addListener("tilesloaded", () => {
          if (!disposed && !authFailed) {
            window.clearTimeout(timer);
            setState("ready");
          }
        });
        if (import.meta.env.DEV) {
          root.dataset.mapInitializations = String(
            Number(root.dataset.mapInitializations || 0) + 1,
          );
          idleListener = map.addListener("idle", () => {
            root.dataset.mapZoom = String(map?.getZoom());
            root.dataset.mapCenter = map?.getCenter()?.toUrlValue();
          });
        }
        let width = root.clientWidth;
        let height = root.clientHeight;
        resize = new ResizeObserver(() => {
          if (root.clientWidth === width && root.clientHeight === height)
            return;
          width = root.clientWidth;
          height = root.clientHeight;
          if (width && height && boundsRef.current)
            map?.fitBounds(boundsRef.current, 45);
        });
        resize.observe(root);
        setInitialized((version) => version + 1);
      })
      .catch(authFail);
    return () => {
      disposed = true;
      window.clearTimeout(timer);
      window.removeEventListener("japan-maps-auth-failure", authFail);
      resize?.disconnect();
      tilesListener?.remove();
      idleListener?.remove();
      for (const entry of markers.values()) {
        entry.removeClickListener();
        entry.marker.map = null;
      }
      markers.clear();
      if (map) google.maps.event.clearInstanceListeners(map);
      mapRef.current = null;
      boundsRef.current = null;
      root.replaceChildren();
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!initialized || !map) return;
    const order = new Map(places.map((p, i) => [p.id, i + 1]));
    const points = places.filter((p) => p.coordinates);
    const ids = new Set(points.map((p) => p.id));
    for (const [id, entry] of markersRef.current) {
      if (!ids.has(id)) {
        entry.removeClickListener();
        entry.marker.map = null;
        markersRef.current.delete(id);
      }
    }
    const bounds = new google.maps.LatLngBounds();
    points.forEach((p) => {
      bounds.extend(p.coordinates!);
      const food = p.category === "restaurant";
      const title = `${lang === "en" ? (food ? "Food" : "Stop") : food ? "美食" : "地点"}: ${lang === "en" ? p.nameEn : p.nameZh}`;
      const label = numbered ? String(order.get(p.id)) : food ? "" : "•";
      const appearance = `${food}:${label}`;
      let entry = markersRef.current.get(p.id);
      if (!entry) {
        const pin = document.createElement("div");
        const marker = new google.maps.marker.AdvancedMarkerElement({
          map,
          position: p.coordinates,
          title,
          gmpClickable: true,
          zIndex: food ? 100 : 1,
        });
        marker.append(pin);
        const onClick = () => setSelected(p.id);
        marker.addEventListener("gmp-click", onClick);
        entry = {
          marker,
          pin,
          appearance: "",
          removeClickListener: () =>
            marker.removeEventListener("gmp-click", onClick),
        };
        markersRef.current.set(p.id, entry);
      } else {
        entry.marker.title = title;
        const position = entry.marker.position as
          google.maps.LatLngLiteral | undefined;
        if (
          position?.lat !== p.coordinates!.lat ||
          position?.lng !== p.coordinates!.lng
        )
          entry.marker.position = p.coordinates;
      }
      if (entry.appearance !== appearance) {
        entry.marker.zIndex = food ? 100 : 1;
        entry.pin.className = "place-marker" + (food ? " food-marker" : "");
        entry.pin.replaceChildren();
        if (food)
          entry.pin.innerHTML =
            '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M4 3v5a3 3 0 0 0 6 0V3M7 3v19M20 22V3c-4 3-4 9 0 9"/></svg>';
        if (label) {
          const text = document.createElement("span");
          text.textContent = label;
          entry.pin.append(text);
        }
        entry.appearance = appearance;
      }
    });
    boundsRef.current = points.length ? bounds : null;
    // A label change or selection must never reset the user's viewport.
    const viewportKey = points
      .map((p) => `${p.id}:${p.coordinates!.lat},${p.coordinates!.lng}`)
      .sort()
      .join("|");
    if (viewportKey !== viewportKeyRef.current || !viewportKey) {
      if (points.length > 1) map.fitBounds(bounds, 45);
      else if (points.length === 1) {
        map.setCenter(points[0].coordinates!);
        map.setZoom(15);
      } else {
        map.setCenter({ lat: 38, lng: 138 });
        map.setZoom(5);
      }
      viewportKeyRef.current = viewportKey;
    }
  }, [initialized, places, lang, numbered]);

  useEffect(() => {
    for (const [id, entry] of markersRef.current)
      entry.pin.classList.toggle("selected-map-marker", id === selected);
  }, [initialized, selected, places, lang, numbered]);
  const current = places.find((p) => p.id === selected);
  return (
    <section className="map-panel" aria-label={t("Places map", "地点地图")}>
      <div
        ref={ref}
        className="google-map"
        role="region"
        aria-label={t("Interactive places map", "互动地点地图")}
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
      {!places.length && (
        <p className="map-help">
          {t("No places planned in this area yet.", "此地区暂无已规划地点。")}
        </p>
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
