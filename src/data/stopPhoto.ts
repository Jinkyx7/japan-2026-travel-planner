import photos from "./stopPhotos.json";
import { destinationPhotos } from "./destinationPhotos";
import type { TripDay, TimelineItem } from "../types";
const placeImages: Record<string, keyof typeof photos> = {
  kitaichi: "Kitaichi Glass",
  sankaku: "Sankaku Market",
  sakaimachi: "Sakaimachi Street",
  letao: "Sakaimachi Street",
  cts: "New Chitose Airport",
  gracery: "Hotel Gracery Sapporo",
  "sapporo-station": "Sapporo Station",
  nakajima: "Nakajima Park",
  susukino: "Susukino",
  tanukikoji: "Tanukikoji",
  "otaru-station": "Otaru Station",
  tengu: "Mt Tengu",
  "music-box": "Otaru Music Box Museum",
  canal: "Otaru Canal",
  zoo: "Asahiyama Zoo",
  falls: "Shirahige Falls",
  "blue-pond": "Blue Pond",
  ningle: "Ningle Terrace",
  hitsujigaoka: "Hitsujigaoka Observation Hill",
  nrt: "Narita International Airport",
  "nrt-t2": "Narita International Airport",
  ikebukuro: "Ikebukuro",
};
export function stopPhoto(day: TripDay, item: TimelineItem) {
  const photo =
    item.placeId === "hanamomiji"
      ? destinationPhotos.Jozankei
      : item.flightId === "pvg-wnz"
        ? photos["Shanghai Pudong International Airport"]
        : item.placeId
          ? photos[placeImages[item.placeId]]
          : undefined;
  const areaView =
    !photo ||
    ["susukino", "ikebukuro", "nrt", "nrt-t2", "letao"].includes(
      item.placeId ?? "",
    );
  return {
    ...(photo ??
      (day.area === "Otaru"
        ? photos["Otaru Canal"]
        : destinationPhotos[day.area])),
    areaView,
  };
}
