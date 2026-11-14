import { mapMarkerSvg, type MapMarkerKind } from "../lib/mapMarkers";

export function MapMarkerIcon({
  kind,
  number,
  className = "",
}: {
  kind: MapMarkerKind;
  number?: number;
  className?: string;
}) {
  return (
    <span
      className={`marker-icon marker-${kind} ${className}`}
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: mapMarkerSvg(kind, number) }}
    />
  );
}
