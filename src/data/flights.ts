import type { Localized } from "../types";
const l = (en: string, zh: string): Localized => ({ en, zh });
type FlightEnd = {
  code: string;
  city: Localized;
  terminal: Localized;
  date: string;
  time: string;
  zone: string;
};
export type Flight = {
  id: string;
  number: string;
  airline: Localized;
  departure: FlightEnd;
  arrival: FlightEnd;
  baggage: Localized[];
  notes: Localized[];
  yearInferred?: boolean;
};
const end = (
  code: string,
  en: string,
  zh: string,
  terminalEn: string,
  terminalZh: string,
  date: string,
  time: string,
  zone: string,
): FlightEnd => ({
  code,
  city: l(en, zh),
  terminal: l(terminalEn, terminalZh),
  date,
  time,
  zone,
});
const unspecified = l(
  "Baggage allowance is not shown in the supplied document; check your airline booking.",
  "所提供文件未列出行李额度，请查看航司预订。",
);
// Booking-document schedules, not live flight status. Passenger identifiers omitted.
export const flights: Flight[] = [
  {
    id: "pvg-cts",
    number: "9C8791",
    airline: l("Spring Airlines", "春秋航空"),
    departure: end(
      "PVG",
      "Shanghai Pudong",
      "上海浦东",
      "Terminal 2",
      "第2航站楼",
      "2026-12-19",
      "08:20",
      "CST · UTC+8",
    ),
    arrival: end(
      "CTS",
      "New Chitose",
      "新千岁",
      "International",
      "国际航站楼",
      "2026-12-19",
      "12:50",
      "JST · UTC+9",
    ),
    baggage: [
      l(
        "Cabin: 1 bag up to 7 kg · 40 × 30 × 20 cm. Personal item subject to airline rules.",
        "手提：1件，最多7公斤，40 × 30 × 20厘米。个人物品按航司规定。",
      ),
      l(
        "Checked: 1 bag up to 20 kg · 100 × 60 × 40 cm.",
        "托运：1件，最多20公斤，100 × 60 × 40厘米。",
      ),
    ],
    notes: [
      l(
        "Economy. The booking document recommends arriving at the airport 3 hours before departure.",
        "经济舱。预订单建议于起飞前3小时抵达机场。",
      ),
    ],
  },
  {
    id: "cts-nrt",
    number: "GK124",
    airline: l("Jetstar Japan", "捷星日本"),
    departure: end(
      "CTS",
      "New Chitose",
      "新千岁",
      "Domestic",
      "国内航站楼",
      "2026-12-25",
      "10:20",
      "JST · UTC+9",
    ),
    arrival: end(
      "NRT",
      "Tokyo Narita",
      "东京成田",
      "Terminal 3",
      "第3航站楼",
      "2026-12-25",
      "12:10",
      "JST · UTC+9",
    ),
    baggage: [
      l(
        "Cabin: 1 personal item + 1 cabin bag, combined weight no more than 7 kg. Cabin bag: 56 × 36 × 23 cm.",
        "随身：1件个人物品及1件手提行李，合计不超过7公斤；手提行李56 × 36 × 23厘米。",
      ),
      l(
        "Checked baggage is not included in the base allowance. The 20 kg add-on is marked pending in the supplied document — confirm purchase before travel.",
        "基础额度不含托运行李。所提供文件中的加购20公斤仍标注为「加购中」，请在出发前确认购买成功。",
      ),
    ],
    notes: [
      l(
        "Economy. Allow time to leave the Airbnb, travel to New Chitose and check in; the document recommends airport arrival 3 hours before departure.",
        "经济舱。需预留民宿退房、前往新千岁及值机时间；文件建议起飞前3小时抵达机场。",
      ),
    ],
  },
  {
    id: "nrt-pvg",
    number: "MU524",
    airline: l("China Eastern Airlines", "中国东方航空"),
    departure: end(
      "NRT",
      "Tokyo Narita",
      "东京成田",
      "Terminal 2",
      "第2航站楼",
      "2026-12-29",
      "13:50",
      "JST · UTC+9",
    ),
    arrival: end(
      "PVG",
      "Shanghai Pudong",
      "上海浦东",
      "Terminal 1",
      "第1航站楼",
      "2026-12-29",
      "16:30",
      "CST · UTC+8",
    ),
    baggage: [
      l(
        "Document states baggage is checked through to Wenzhou; the allowance is not listed.",
        "文件标注行李直挂温州，但未列出具体行李额度。",
      ),
    ],
    notes: [
      l(
        "Economy · 1 h 35 min connection at Shanghai Pudong to FM9527.",
        "经济舱 · 上海浦东中转1小时35分钟，衔接FM9527。",
      ),
    ],
  },
  {
    id: "pvg-wnz",
    number: "FM9527",
    airline: l("Shanghai Airlines", "上海航空"),
    departure: end(
      "PVG",
      "Shanghai Pudong",
      "上海浦东",
      "Terminal 1",
      "第1航站楼",
      "2026-12-29",
      "18:05",
      "CST · UTC+8",
    ),
    arrival: end(
      "WNZ",
      "Wenzhou Longwan",
      "温州龙湾",
      "Terminal 2",
      "第2航站楼",
      "2026-12-29",
      "19:30",
      "CST · UTC+8",
    ),
    baggage: [
      l(
        "Part of the Tokyo–Wenzhou journey; document states baggage is checked through. Allowance not listed.",
        "东京至温州联程的一段；文件标注行李直挂，未列出具体额度。",
      ),
    ],
    notes: [l("Economy · connecting from MU524.", "经济舱 · 衔接MU524。")],
  },
  {
    id: "wnz-pvg",
    number: "FM9524",
    airline: l("Shanghai Airlines", "上海航空"),
    departure: end(
      "WNZ",
      "Wenzhou Longwan",
      "温州龙湾",
      "Terminal 2",
      "第2航站楼",
      "2027-01-09",
      "21:05",
      "CST · UTC+8",
    ),
    arrival: end(
      "PVG",
      "Shanghai Pudong",
      "上海浦东",
      "Terminal 1",
      "第1航站楼",
      "2027-01-09",
      "22:30",
      "CST · UTC+8",
    ),
    baggage: [unspecified],
    yearInferred: true,
    notes: [
      l(
        "Economy · 1 h 40 min until MU779 at 00:10 the next day. Through-check baggage is not specified.",
        "经济舱 · 中转1小时40分钟，次日00:10衔接MU779。文件未说明行李是否直挂。",
      ),
    ],
  },
  {
    id: "pvg-akl",
    number: "MU779",
    airline: l("China Eastern Airlines", "中国东方航空"),
    departure: end(
      "PVG",
      "Shanghai Pudong",
      "上海浦东",
      "Terminal 1",
      "第1航站楼",
      "2027-01-10",
      "00:10",
      "CST · UTC+8",
    ),
    arrival: end(
      "AKL",
      "Auckland",
      "奥克兰",
      "International",
      "国际航站楼",
      "2027-01-10",
      "16:35",
      "NZDT · UTC+13",
    ),
    baggage: [unspecified],
    yearInferred: true,
    notes: [
      l(
        "Economy · midnight departure: go to the airport on the evening of 9 January.",
        "经济舱 · 凌晨起飞：需于1月9日晚抵达机场。",
      ),
    ],
  },
];
export const flightById = Object.fromEntries(
  flights.map((flight) => [flight.id, flight]),
);
