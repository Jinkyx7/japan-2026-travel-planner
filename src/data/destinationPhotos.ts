import type { Area } from "../types";
import photos from "./photos.json";
import { trip } from "./trip";
export const destinationPhotos: Record<
  Area,
  {
    src: string;
    alt: string;
    source?: string;
    author?: string;
    license?: string;
    licenseUrl?: string;
  }
> = {
  Sapporo: {
    ...photos.sapporo,
    alt: "Snow-covered Odori Park in Sapporo, photographed during a past snow festival",
  },
  Jozankei: {
    ...photos.jozankei,
    alt: "Snow lanterns in Jozankei, photographed in 2013",
  },
  "Asahikawa / Biei": {
    ...photos.biei,
    alt: "Winter landscape in Biei, Hokkaido",
  },
  Tokyo: { ...photos.tokyo, alt: "Tokyo skyline" },
  Otaru: { src: trip.hero, alt: "Illustration inspired by Otaru in winter" },
};
