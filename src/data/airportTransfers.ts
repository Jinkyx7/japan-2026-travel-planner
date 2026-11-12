import type { TimelineItem, Localized } from "../types";
const l = (en: string, zh: string): Localized => ({ en, zh });
const hokkaido = {
  label: "JR Hokkaido · Airport trains",
  url: "https://www.jrhokkaido.co.jp/global/english/travel/airport.html",
};
const keisei = {
  label: "Keisei · Ikebukuro via Nippori",
  url: "https://www.keisei.co.jp/keisei/tetudou/skyliner/us/traffic/skyliner_fares.php",
};
const terminal = {
  label: "Narita · Terminal 3 station access",
  url: "https://www.narita-airport.jp/en/access/shuttlebus/walking-through/",
};
export const airportTransfers: Record<string, TimelineItem> = {
  arrival: {
    id: "airport-to-hotel",
    kind: "train",
    placeId: "gracery",
    title: l("New Chitose → Sapporo hotel", "新千岁机场 → 札幌酒店"),
    note: l(
      "After immigration and baggage collection: JR Airport train to Sapporo, then walk to Hotel Gracery.",
      "入境及取行李后，乘JR机场列车至札幌，再步行前往格拉斯丽酒店。",
    ),
    transport: { originId: "cts", destinationId: "gracery" },
    transferSteps: [
      l(
        "Follow signs from International Arrivals to the JR New Chitose Airport station beneath the domestic terminal.",
        "从国际到达区按指示前往国内航站楼地下的JR新千岁机场站。",
      ),
      l(
        "Take a JR Airport train to Sapporo Station. Rapid trains take about 37 minutes at fastest; allow extra time for walking, waiting and winter disruption.",
        "乘JR机场列车到札幌站。快速列车最快约37分钟；另预留步行、候车及冬季延误时间。",
      ),
      l(
        "Use Sapporo Station's south side and follow walking directions to Hotel Gracery. Check-in opens at 14:00; your actual arrival depends on airport processing.",
        "从札幌站南侧出站，按步行导航前往格拉斯丽酒店。14:00起可入住，实际抵达时间取决于入境及交通。",
      ),
    ],
    transportSources: [hokkaido],
  },
  sapporo: {
    id: "airbnb-to-airport",
    kind: "train",
    placeId: "cts",
    title: l("Sapporo Airbnb → New Chitose", "札幌民宿 → 新千岁机场"),
    note: l(
      "Leave early for the 10:20 flight. Walk or take a taxi to Sapporo Station, or use the Namboku subway from Susukino to Sapporo, then take a JR Airport train.",
      "为10:20航班提前出发。步行或打车至札幌站，或从薄野乘南北线至札幌，再转JR机场列车。",
    ),
    transport: { originId: "sapporo-rail", destinationId: "cts" },
    transferSteps: [
      l(
        "Check out and follow the host's directions from the Airbnb to Susukino station, or take a taxi directly to JR Sapporo Station with luggage.",
        "退房后按房东指南步行至薄野站，或携行李直接打车到JR札幌站。",
      ),
      l(
        "From Susukino, take the Namboku Line toward Asabu to Sapporo, then follow JR signs. Board an Airport train bound for New Chitose Airport.",
        "从薄野乘南北线往麻生方向至札幌，按JR指示换乘开往新千岁机场的机场列车。",
      ),
      l(
        "Your updated schedule reaches New Chitose at 08:00 for check-in, baggage drop and security until 09:40. Follow Domestic Departures signs to Jetstar. This is 2 h 20 min before the 10:20 departure; the booking document recommends 3 hours. Confirm the airline’s deadlines and check early train availability.",
        "更新计划08:00抵达新千岁，08:00–09:40值机、托运及安检，按国内出发指示前往捷星。距10:20起飞2小时20分；预订文件建议提前3小时，请核实航司截止时间及早班列车。",
      ),
      l(
        "The map starts from the Susukino area, not the private apartment. Add the exact address in your own Maps app and check winter service updates.",
        "导航起点为薄野地区，并非具体民宿。请在自己的地图中填写准确地址，并查看冬季运行信息。",
      ),
    ],
    transportSources: [hokkaido],
  },
  tokyoArrival: {
    id: "narita-to-airbnb",
    kind: "train",
    placeId: "ikebukuro",
    title: l("Narita T3 → Ikebukuro Airbnb", "成田T3 → 池袋民宿"),
    note: l(
      "After the 12:10 arrival: walk to Terminal 2·3 station, take Keisei Skyliner to Nippori, then JR Yamanote Line to Ikebukuro.",
      "12:10抵达并取行李后，步行至机场第2·3航站楼站，乘京成Skyliner至日暮里，换JR山手线到池袋。",
    ),
    transport: { originId: "nrt", destinationId: "ikebukuro" },
    transferSteps: [
      l(
        "Collect baggage in Terminal 3. Follow the signed corridor to Airport Terminal 2·3 Station; the airport quotes about 13 minutes from the T3 arrivals information counter to the station gates.",
        "在T3取行李后，沿指示通道走至机场第2·3航站楼站。机场指引说明从T3到达问讯处步行至车站闸机约13分钟。",
      ),
      l(
        "Buy a reserved-seat Skyliner ticket to Nippori. At Nippori, follow the JR transfer signs and take the Yamanote Line toward Ikebukuro / Shinjuku; get off at Ikebukuro.",
        "购买至日暮里的Skyliner指定席车票。在日暮里按JR换乘指示转山手线往池袋／新宿方向，在池袋下车。",
      ),
      l(
        "Use the host's exact address and exit instructions for the final walk (the listing says about 9 minutes from JR Ikebukuro). Check-in starts at 16:00; ask the host about luggage storage if you arrive earlier.",
        "最后一段步行请使用房东提供的准确地址及出口指引（房源称距JR池袋约9分钟）。16:00起入住，提前抵达时请向房东确认行李寄存。",
      ),
    ],
    transportSources: [keisei, terminal],
  },
  tokyoDeparture: {
    id: "checkout",
    kind: "train",
    placeId: "nrt-t2",
    title: l("Tokyo Airbnb → Narita T2", "东京民宿 → 成田T2"),
    note: l(
      "Check out early for MU524 at 13:50. Ikebukuro → Nippori by JR Yamanote Line, then Keisei Skyliner to Airport Terminal 2·3 Station.",
      "为13:50的MU524提前退房。池袋乘JR山手线至日暮里，换京成Skyliner至机场第2·3航站楼站。",
    ),
    transport: { originId: "ikebukuro", destinationId: "nrt-t2" },
    transferSteps: [
      l(
        "Leave the Airbnb using the host's checkout instructions. Walk or take a taxi to Ikebukuro Station with your luggage; do not wait until the 11:00 checkout deadline.",
        "按房东要求退房，携行李步行或打车到池袋站；不要等到11:00最晚退房时才出发。",
      ),
      l(
        "Take JR Yamanote Line toward Ueno / Tokyo and get off at Nippori. Transfer to a reserved-seat Keisei Skyliner bound for Narita Airport.",
        "乘JR山手线往上野／东京方向，在日暮里下车，换乘开往成田机场的京成Skyliner指定席列车。",
      ),
      l(
        "Get off at Airport Terminal 2·3 Station and follow Terminal 2 International Departures signs. Check airline check-in deadlines and select a train with a generous buffer; a planning target of about 10:50 gives 3 hours before departure.",
        "在机场第2·3航站楼站下车，按T2国际出发指示前往值机。核实航司截止时间并预留充足余量；可先以约10:50抵达为规划目标，即起飞前3小时。",
      ),
      l(
        "Confirm the final train timetable closer to travel. Directions use the Ikebukuro area; enter the private Airbnb address yourself for a door-to-door route.",
        "临近出行时确认具体列车时刻。导航使用池袋地区，请自行填写民宿准确地址以获得门到门路线。",
      ),
    ],
    transportSources: [keisei],
  },
};
