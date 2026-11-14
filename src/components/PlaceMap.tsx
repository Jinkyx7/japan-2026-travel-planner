import { useEffect, useRef, useState } from "react";
import { MapPin, ArrowUpRight } from "lucide-react";
import type { Place } from "../types";
import { loadGoogleMaps } from "../services/googleMapsLoader";
import { useApp } from "./AppContext";
import { MapsLink, PlaceName } from "./UI";
import { mapMarkerKind, mapMarkerSvg } from "../lib/mapMarkers";
import { MapMarkerIcon } from "./MapMarkerIcon";
import {
  mapFilters,
  matchesMapFilters,
  toggleMapFilter,
  type MapFilterSelection,
} from "../lib/mapFilters";
export function PlaceMap({
  places,
  numbered = true,
  filters,
  onFiltersChange,
  showFilters = true,
}: {
  places: Place[];
  numbered?: boolean;
  filters?: MapFilterSelection;
  onFiltersChange?: (filters: MapFilterSelection) => void;
  showFilters?: boolean;
}) {
  const { lang, t } = useApp();
  const [localFilters, setLocalFilters] = useState<MapFilterSelection>([]);
  const activeFilters = filters ?? localFilters;
  const visiblePlaces = places.filter((p) =>
    matchesMapFilters(p, activeFilters),
  );
  const ref = useRef<HTMLDivElement>(null);
  const [selected, setSelected] = useState<string>();
  const [online, setOnline] = useState(navigator.onLine);
  const [state, setState] = useState<"loading" | "ready" | "fallback">(
    import.meta.env.VITE_GOOGLE_MAPS_API_KEY && navigator.onLine
      ? "loading"
      : "fallback",
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

  useEffect(() => {
    const connected = () => {
      setOnline(true);
      setState(
        import.meta.env.VITE_GOOGLE_MAPS_API_KEY ? "loading" : "fallback",
      );
    };
    const disconnected = () => {
      setOnline(false);
      setState("fallback");
    };
    window.addEventListener("online", connected);
    window.addEventListener("offline", disconnected);
    return () => {
      window.removeEventListener("online", connected);
      window.removeEventListener("offline", disconnected);
    };
  }, []);

  // Create once per mounted panel. React updates never run during pan/zoom.
  useEffect(() => {
    const root = ref.current;
    if (!root || !online || !import.meta.env.VITE_GOOGLE_MAPS_API_KEY) return;
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
  }, [online]);

  useEffect(() => {
    const map = mapRef.current;
    if (!initialized || !map) return;
    const order = new Map(places.map((p, i) => [p.id, i + 1]));
    const points = visiblePlaces.filter((p) => p.coordinates);
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
      const food = p.category === "restaurant" || p.category === "cafe";
      const kind = mapMarkerKind(p.category);
      const label = numbered ? order.get(p.id) : undefined;
      const type =
        lang === "en"
          ? { food: "Food", stay: "Stay", stop: "Stop", airport: "Airport" }[
              kind
            ]
          : { food: "美食", stay: "住宿", stop: "地点", airport: "机场" }[kind];
      const title = `${type}${label ? ` ${label}` : ""}: ${lang === "en" ? p.nameEn : p.nameZh}`;
      const appearance = `${kind}:${label ?? ""}`;
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
        entry.pin.className = `place-marker marker-${kind}`;
        entry.pin.innerHTML = mapMarkerSvg(kind, label);
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
  }, [initialized, places, lang, numbered, visiblePlaces]);

  useEffect(() => {
    for (const [id, entry] of markersRef.current)
      entry.pin.classList.toggle("selected-map-marker", id === selected);
  }, [initialized, selected, places, lang, numbered, visiblePlaces]);
  const current = visiblePlaces.find((p) => p.id === selected);
  return (
    <section className="map-panel" aria-label={t("Places map", "地点地图")}>
      {showFilters && (
        <div
          className="chips map-filters"
          role="group"
          aria-label={t(
            "Filter by place type (select multiple)",
            "按地点类型筛选（可多选）",
          )}
        >
          {mapFilters.map((option) => {
            const active =
              option.id === "all"
                ? !activeFilters.length
                : activeFilters.includes(option.id);
            return (
              <button
                key={option.id}
                aria-pressed={active}
                className={active ? "active" : ""}
                onClick={() =>
                  (onFiltersChange ?? setLocalFilters)(
                    toggleMapFilter(activeFilters, option.id),
                  )
                }
              >
                {t(option.en, option.zh)}
              </button>
            );
          })}
        </div>
      )}
      <div className="map-stage">
        <div
          ref={ref}
          className="google-map"
          role="region"
          aria-label={t("Interactive places map", "互动地点地图")}
          style={{ display: state === "fallback" ? "none" : "block" }}
        />
        {state === "loading" && (
          <div className="map-loading">
            {t("Loading map…", "正在加载地图…")}
          </div>
        )}
      </div>
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
            {visiblePlaces.map((p) => (
              <button
                key={p.id}
                className={selected === p.id ? "selected" : ""}
                onClick={() => setSelected(p.id)}
              >
                <MapMarkerIcon
                  kind={mapMarkerKind(p.category)}
                  number={numbered ? places.indexOf(p) + 1 : undefined}
                  className="map-list-marker"
                />
                {lang === "en" ? p.nameEn : p.nameZh}
              </button>
            ))}
          </div>
          {!visiblePlaces.length && (
            <p>
              {t("No places match these filters.", "当前筛选条件下没有地点。")}
            </p>
          )}
        </div>
      )}
      {!visiblePlaces.length && state !== "fallback" && (
        <p className="map-help">
          {t("No places match these filters.", "当前筛选条件下没有地点。")}
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
                  cafe: "咖啡与甜点",
                  shopping: "购物",
                  hotel: "住宿",
                  station: "车站",
                  transport: "交通",
                  airport: "机场",
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
          <MapMarkerIcon kind="stop" className="legend-marker" />
          {t("Things to do", "景点与游玩")}
        </span>
        <span className="food-legend">
          <MapMarkerIcon kind="food" className="legend-marker" />
          {t("Food & cafés", "美食与咖啡")}
        </span>
        <span className="airport-legend">
          <MapMarkerIcon kind="airport" className="legend-marker" />
          {t("Airports", "机场")}
        </span>
        <span className="stay-legend">
          <MapMarkerIcon kind="stay" className="legend-marker" />
          {t("Accommodation", "住宿")}
        </span>
      </div>
      <div className="map-caption">
        <span>
          <MapPin size={13} />
          {visiblePlaces.length} {t("places", "个地点")}
        </span>
        <a
          href={
            visiblePlaces[0]?.googleMapsUrl ??
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
