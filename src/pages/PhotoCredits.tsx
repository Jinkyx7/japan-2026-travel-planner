import { useApp } from "../components/AppContext";
import { PageHeading } from "../components/UI";
import destination from "../data/photos.json";
import stops from "../data/stopPhotos.json";
export function PhotoCredits() {
  const { t } = useApp();
  return (
    <>
      <PageHeading
        title={t("Photo credits", "图片来源")}
        subtitle={t(
          "Photographs are cropped to fit. Images show past views; season and appearance may differ during your trip.",
          "照片经过裁切，展示历史景观；旅行时季节与实际样貌可能不同。",
        )}
      />
      <div className="credits-list">
        {Object.entries({ ...destination, ...stops }).map(([name, photo]) => (
          <article className="panel" key={name}>
            <img src={photo.src} alt={name} loading="lazy" />
            <div>
              <h2>{name}</h2>
              <p>{photo.author}</p>
              <a href={photo.source} target="_blank" rel="noreferrer">
                {t("Original photograph", "原始照片")}
              </a>
              {" · "}
              <a href={photo.licenseUrl} target="_blank" rel="noreferrer">
                {photo.license}
              </a>
              <p>{t("Cropped to fit.", "已裁切展示。")}</p>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
