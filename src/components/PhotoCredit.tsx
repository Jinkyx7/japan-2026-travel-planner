import { destinationPhotos } from "../data/destinationPhotos";
import type { Area } from "../types";
import { useApp } from "./AppContext";
export function PhotoCredit({ area }: { area: Area }) {
  const photo = destinationPhotos[area];
  const { t } = useApp();
  return (
    <p className="photo-credit">
      {photo.source ? (
        <>
          <a href={photo.source} target="_blank" rel="noreferrer">
            {t("Destination photo", "目的地照片")} · {photo.author}
          </a>
          {" · "}
          <a href={photo.licenseUrl} target="_blank" rel="noreferrer">
            {photo.license}
          </a>
          {" · "}
          {t("Cropped to fit; historical view", "裁切展示；历史照片")}
        </>
      ) : (
        t("AI illustration inspired by Otaru", "以小樽为灵感的 AI 插画")
      )}
    </p>
  );
}
