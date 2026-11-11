import { ArrowUpRight, ChevronRight, MapPin } from "lucide-react";
import type { ReactNode } from "react";
import type { Place } from "../types";
import { useApp } from "./AppContext";
export function PageHeading({
  eyebrow,
  title,
  subtitle,
  action,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <header className="page-heading">
      <div>
        {eyebrow && <div className="eyebrow">{eyebrow}</div>}
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {action}
    </header>
  );
}
export function Tabs({
  items,
  value,
  onChange,
}: {
  items: { id: string; label: string }[];
  value: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="tabs" role="tablist">
      {items.map((i) => (
        <button
          key={i.id}
          type="button"
          role="tab"
          aria-selected={value === i.id}
          tabIndex={value === i.id ? 0 : -1}
          className={value === i.id ? "active" : ""}
          onClick={() => onChange(i.id)}
          onKeyDown={(event) => {
            const index = items.findIndex((item) => item.id === i.id);
            const next =
              event.key === "ArrowRight"
                ? (index + 1) % items.length
                : event.key === "ArrowLeft"
                  ? (index - 1 + items.length) % items.length
                  : event.key === "Home"
                    ? 0
                    : event.key === "End"
                      ? items.length - 1
                      : -1;
            if (next < 0) return;
            event.preventDefault();
            onChange(items[next].id);
            const buttons =
              event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>(
                "button",
              );
            buttons?.[next]?.focus();
          }}
        >
          {i.label}
        </button>
      ))}
    </div>
  );
}
export function MapsLink({ place }: { place: Place }) {
  const { t } = useApp();
  return (
    <a
      className="text-link"
      href={place.googleMapsUrl}
      target="_blank"
      rel="noreferrer"
    >
      {t("Google Maps", "谷歌地图")}
      <ArrowUpRight size={14} />
    </a>
  );
}
export function PlaceName({
  place,
  all = false,
}: {
  place: Place;
  all?: boolean;
}) {
  const { lang } = useApp();
  return (
    <>
      <strong>{lang === "en" ? place.nameEn : place.nameZh}</strong>
      <span className="ja">
        {all && (lang === "en" ? place.nameZh : place.nameEn) + " · "}
        {place.nameJa}
      </span>
    </>
  );
}
export function EmptyState({
  icon,
  title,
  children,
}: {
  icon?: ReactNode;
  title: string;
  children?: ReactNode;
}) {
  return (
    <div className="empty-state">
      {icon ?? <MapPin size={28} />}
      <h3>{title}</h3>
      {children}
    </div>
  );
}
export { ChevronRight };
