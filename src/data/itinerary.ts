import type { Localized, TimelineItem, TripDay } from "../types";
import { airportTransfers } from "./airportTransfers";
const l = (en: string, zh: string): Localized => ({ en, zh });
const stop = (
  id: string,
  time: string | undefined,
  en: string,
  zh: string,
  placeId?: string,
  note?: Localized,
  kind?: TimelineItem["kind"],
): TimelineItem => ({ id, time, title: l(en, zh), placeId, note, kind });
const updatedDays = [
  {
    id: "dec-19",
    date: "2026-12-19",
    area: "Sapporo",
    name: {
      en: "Hello, Hokkaido",
      zh: "你好，北海道",
    },
    nameJa: "札幌",
    summary: {
      en: "Arrival · TV Tower · Christmas market · Winter lights",
      zh: "抵达 · 电视塔 · 圣诞市集 · 冬日灯光",
    },
    accommodationId: "gracery",
    items: [
      {
        id: "arrival",
        time: "12:50",
        title: {
          en: "Arrive at New Chitose Airport",
          zh: "抵达新千岁机场",
        },
        flightId: "pvg-cts",
        placeId: "cts",
        kind: "flight",
        note: {
          en: "Spring Airlines 9C8791 · PVG T2 08:20 → CTS International 12:50 (local times)",
          zh: "春秋航空9C8791 · 浦东T2 08:20 → 新千岁国际航站楼12:50（当地时间）",
        },
      },
      {
        id: "airport-to-hotel",
        time: "14:00–15:15",
        title: {
          en: "Travel to Sapporo",
          zh: "前往札幌",
        },
        placeId: "gracery",
        kind: "train",
        transferKey: "arrival",
      },
      {
        id: "hotel",
        time: "15:15–16:15",
        title: {
          en: "Hotel Gracery check-in & rest",
          zh: "Hotel Gracery 入住、休息",
        },
        placeId: "gracery",
        kind: "stay",
      },
      {
        id: "to-odori",
        time: "16:30–17:00",
        title: {
          en: "Travel to Odori",
          zh: "前往大通",
        },
        transport: {
          originId: "gracery",
          destinationId: "odori",
        },
        placeId: "odori",
        kind: "walk",
      },
      {
        id: "dinner",
        time: "17:00–18:00",
        title: {
          en: "Dinner",
          zh: "晚餐",
        },
        kind: "food",
        note: {
          en: "Restaurant to be decided near Odori.",
          zh: "大通附近餐厅待定。",
        },
      },
      {
        id: "tv-tower",
        time: "18:15–19:00",
        title: {
          en: "Sapporo TV Tower night views",
          zh: "札幌电视塔夜景",
        },
        placeId: "tv-tower",
      },
      {
        id: "market",
        time: "19:00–20:00",
        title: {
          en: "Munich Christmas Market",
          zh: "慕尼黑圣诞市集",
        },
        placeId: "christmas-market",
        note: l(
          "Odori Park Nishi 1–2. 20 Nov–25 Dec 2026, 11:00–21:00; last orders 20:45.",
          "大通公园西1～2丁目。2026/11/20–12/25，11:00–21:00，最后点单20:45。",
        ),
      },
      {
        id: "lights",
        time: "20:00–20:45",
        title: {
          en: "White Illumination · Odori Park Nishi 1–5",
          zh: "White Illumination · 大通公园西1～5丁目散步",
        },
        placeId: "illumination",
        note: l(
          "Odori venue, Nishi 1–5. Lights 16:30–22:00 on 19 December. Continue from the nearby Christmas market on foot.",
          "大通会场：西1～5丁目，12月19日点灯16:30–22:00。从附近圣诞市集步行继续参观。",
        ),
      },
      {
        id: "return",
        time: "20:45+",
        title: {
          en: "Walk back towards the hotel along Ekimae-dori lights",
          zh: "沿札幌站前通灯饰慢慢往酒店方向走",
        },
        transport: {
          originId: "illumination",
          destinationId: "gracery",
        },
        placeId: "gracery",
        kind: "walk",
        relatedPlaceIds: ["ekimae-lights"],
        note: l(
          "From Odori, turn north along Sapporo Ekimae-dori towards Sapporo Station and Hotel Gracery, enjoying the illuminated trees on the way. Minami 1-jo lights (Nishi 1–3), just south of Odori, are an optional nearby detour.",
          "从大通沿札幌站前通向北，朝札幌站及Hotel Gracery方向散步，沿途欣赏树上灯饰。大通南侧的南一条通西1～3丁目灯饰可作为附近的可选绕行。",
        ),
      },
    ],
  },
  {
    id: "dec-20",
    date: "2026-12-20",
    area: "Jozankei",
    name: {
      en: "Sapporo → Jozankei",
      zh: "札幌 → 定山溪",
    },
    nameJa: "定山渓",
    summary: {
      en: "Red Brick Office · Hokkaido University · Hotel shuttle · Onsen",
      zh: "红砖道厅 · 北海道大学 · 接驳巴士 · 温泉",
    },
    accommodationId: "hanamomiji",
    items: [
      {
        id: "morning",
        time: "09:00–09:40",
        title: {
          en: "Breakfast, checkout & luggage storage",
          zh: "早餐、退房、寄存行李",
        },
        placeId: "gracery",
        kind: "stay",
        note: {
          en: "Start the morning at 09:00. Leave luggage at Hotel Gracery; confirm storage with reception.",
          zh: "早上09:00开始安排。行李寄存在Hotel Gracery，请向前台确认寄存安排。",
        },
      },
      {
        id: "to-red-brick",
        time: "09:40–09:50",
        title: {
          en: "Walk to the Red Brick Office",
          zh: "前往北海道厅旧本厅舍",
        },
        transport: {
          originId: "gracery",
          destinationId: "red-brick",
        },
        placeId: "red-brick",
        kind: "walk",
      },
      {
        id: "red-brick",
        time: "09:50–10:40",
        title: {
          en: "Former Hokkaido Government Office (Red Brick Office)",
          zh: "北海道厅旧本厅舍（红砖道厅）",
        },
        placeId: "red-brick",
      },
      {
        id: "to-university",
        time: "10:40–11:10",
        title: {
          en: "Travel to Hokkaido University",
          zh: "前往北海道大学",
        },
        transport: {
          originId: "red-brick",
          destinationId: "hokkaido-university",
        },
        placeId: "hokkaido-university",
        kind: "walk",
      },
      {
        id: "university",
        time: "11:10–12:25",
        title: {
          en: "Hokkaido University snowy campus walk",
          zh: "北海道大学校园雪景散步",
        },
        placeId: "hokkaido-university",
      },
      {
        id: "lunch",
        time: "12:40–13:40",
        title: {
          en: "Lunch near Sapporo Station",
          zh: "札幌站附近午餐",
        },
        placeId: "sapporo-station",
        kind: "food",
      },
      {
        id: "luggage",
        time: "13:40–14:00",
        title: {
          en: "Collect luggage at Hotel Gracery",
          zh: "返回 Hotel Gracery 取行李",
        },
        transport: {
          originId: "sapporo-station",
          destinationId: "gracery",
        },
        placeId: "gracery",
        kind: "walk",
      },
      {
        id: "to-shuttle",
        time: "14:10–14:30",
        title: {
          en: "Walk to JR Sapporo Station North Exit",
          zh: "前往 JR札幌站北口",
        },
        transport: {
          originId: "gracery",
          destinationId: "sapporo-station",
        },
        placeId: "sapporo-station",
        kind: "walk",
      },
      {
        id: "meet",
        time: "14:30–14:50",
        title: {
          en: "Shuttle meeting & waiting",
          zh: "Shuttle 集合、候车",
        },
        placeId: "sapporo-station",
        kind: "bus",
      },
      {
        id: "shuttle",
        time: "15:00",
        title: {
          en: "Hotel shuttle to Hanamomiji",
          zh: "Hotel Shuttle 出发前往 Hanamomiji",
        },
        transport: {
          originId: "sapporo-station",
          destinationId: "hanamomiji",
          confirmed: true,
          passengers: 3,
        },
        placeId: "hanamomiji",
        kind: "bus",
      },
      {
        id: "onsen",
        time: "~16:00",
        title: {
          en: "Arrive & check in at Hanamomiji",
          zh: "抵达 Hanamomiji、入住",
        },
        placeId: "hanamomiji",
        kind: "stay",
      },
      {
        id: "relax",
        time: "16:00+",
        title: {
          en: "Onsen & rest",
          zh: "泡温泉、休息",
        },
        placeId: "hanamomiji",
      },
      {
        id: "dinner",
        time: "Evening",
        title: {
          en: "Kaiseki dinner",
          zh: "怀石晚餐",
        },
        timeLabel: {
          en: "Evening",
          zh: "晚上",
        },
        placeId: "hanamomiji",
        kind: "food",
      },
    ],
  },
  {
    id: "dec-21",
    date: "2026-12-21",
    area: "Sapporo",
    name: {
      en: "Jozankei → Sapporo",
      zh: "定山溪 → 札幌",
    },
    nameJa: "札幌",
    summary: {
      en: "Nakajima Park · Tanukikoji · Factory Christmas tree · Susukino",
      zh: "中岛公园 · 狸小路 · Factory圣诞树 · 薄野",
    },
    accommodationId: "susukino",
    items: [
      {
        id: "morning",
        time: "08:00–09:30",
        title: {
          en: "Hotel breakfast, onsen & packing",
          zh: "酒店早餐、温泉、整理行李",
        },
        placeId: "hanamomiji",
        kind: "stay",
      },
      {
        id: "shuttle",
        time: "10:00",
        title: {
          en: "Hotel shuttle back to Sapporo",
          zh: "Hotel Shuttle 返回札幌",
        },
        transport: {
          originId: "hanamomiji",
          destinationId: "sapporo-station",
          confirmed: true,
          passengers: 3,
        },
        placeId: "sapporo-station",
        kind: "bus",
      },
      {
        id: "arrival",
        time: "~11:00–11:30",
        title: {
          en: "Arrive at JR Sapporo Station North Exit",
          zh: "抵达 JR札幌站北口",
        },
        placeId: "sapporo-station",
      },
      {
        id: "lunch",
        time: "12:00–13:00",
        title: {
          en: "Lunch in Sapporo",
          zh: "札幌午餐",
        },
        kind: "food",
      },
      {
        id: "park",
        time: "13:30–14:30",
        title: {
          en: "Nakajima Park",
          zh: "中岛公园",
        },
        placeId: "nakajima",
      },
      {
        id: "to-airbnb",
        time: "14:30–15:00",
        title: {
          en: "Travel to the Susukino Airbnb",
          zh: "前往薄野 Airbnb",
        },
        transport: {
          originId: "nakajima",
          destinationId: "susukino",
        },
        placeId: "susukino",
        kind: "walk",
      },
      {
        id: "checkin",
        time: "15:00–16:00",
        title: {
          en: "Airbnb check-in & rest",
          zh: "Airbnb 入住、休息",
        },
        placeId: "susukino",
        kind: "stay",
      },
      {
        id: "shopping",
        time: "16:00–17:15",
        title: {
          en: "Tanukikoji shopping",
          zh: "狸小路购物",
        },
        placeId: "tanukikoji",
      },
      {
        id: "to-factory",
        time: "17:15–17:50",
        title: l("Walk to Sapporo Factory Atrium", "前往 Sapporo Factory 中庭"),
        placeId: "sapporo-factory",
        kind: "walk",
        transport: { originId: "tanukikoji", destinationId: "sapporo-factory" },
        note: l(
          "Allow 35 minutes, including a buffer for winter walking. Take a taxi if conditions are slippery or you are running late.",
          "预留35分钟，包含冬季步行余量；路滑或时间紧时可改乘出租车。",
        ),
      },
      {
        id: "factory-tree",
        time: "17:50–18:25",
        title: l(
          "Giant Christmas tree & 18:00 light show",
          "巨型圣诞树及18:00灯光秀",
        ),
        placeId: "sapporo-factory",
        note: l(
          "Arrive before 18:00 for the approximately 5-minute music-and-light show, then take photos in the Atrium. Official event: 3 Nov–25 Dec 2026; lights 16:00–22:00, shows hourly from 16:00 through 21:00.",
          "18:00前到中庭等候约5分钟的音乐灯光秀，之后拍照。官方活动日期2026/11/3–12/25；点灯16:00–22:00，灯光秀16:00至21:00每逢整点开始。",
        ),
      },
      {
        id: "return-susukino",
        time: "18:25–19:00",
        title: l("Return to Susukino for dinner", "返回薄野吃晚餐"),
        placeId: "susukino",
        kind: "walk",
        transport: { originId: "sapporo-factory", destinationId: "susukino" },
        note: l(
          "The map ends at Susukino Station as an area reference; choose your dinner venue nearby.",
          "地图以薄野站为地区参考点，晚餐可在附近选择餐厅。",
        ),
      },
      {
        id: "dinner",
        time: "19:00–20:30",
        title: {
          en: "Dinner in Susukino",
          zh: "薄野晚餐",
        },
        kind: "food",
        note: {
          en: "Choose a restaurant in Susukino.",
          zh: "在薄野选择餐厅。",
        },
      },
    ],
  },
  {
    id: "dec-22",
    date: "2026-12-22",
    area: "Otaru",
    name: {
      en: "A day in Otaru",
      zh: "小樽的一天",
    },
    nameJa: "小樽 · おたる",
    summary: {
      en: "Mt. Tengu · Seafood · Sakaimachi · Canal photography",
      zh: "天狗山 · 海鲜 · 堺町通 · 运河拍照",
    },
    accommodationId: "susukino",
    items: [
      {
        id: "depart",
        time: "07:30",
        title: {
          en: "Leave the Airbnb",
          zh: "从 Airbnb 出发",
        },
        placeId: "susukino",
        kind: "walk",
      },
      {
        id: "jr",
        time: "08:15–09:05",
        title: {
          en: "Sapporo → Otaru",
          zh: "札幌 → 小樽",
        },
        transport: {
          originId: "sapporo-rail",
          destinationId: "otaru-station",
        },
        placeId: "otaru-station",
        kind: "train",
      },
      {
        id: "to-mountain",
        time: "09:05–09:30",
        title: {
          en: "Travel to Mt. Tengu",
          zh: "前往天狗山",
        },
        transport: {
          originId: "otaru-station",
          destinationId: "tengu",
        },
        placeId: "tengu",
        kind: "bus",
      },
      {
        id: "mountain",
        time: "09:30–11:00",
        title: {
          en: "Mt. Tengu Ropeway & snowy views",
          zh: "天狗山缆车、雪景",
        },
        placeId: "tengu",
      },
      {
        id: "to-station",
        time: "11:00–11:30",
        title: {
          en: "Return to the Otaru Station area",
          zh: "返回小樽站附近",
        },
        transport: {
          originId: "tengu",
          destinationId: "otaru-station",
        },
        placeId: "otaru-station",
        kind: "bus",
      },
      {
        id: "lunch",
        time: "11:30–12:30",
        title: {
          en: "Seafood lunch at Sankaku Market",
          zh: "三角市场海鲜午餐",
        },
        placeId: "sankaku",
        kind: "food",
      },
      {
        id: "to-street",
        time: "12:30–13:00",
        title: {
          en: "Walk to Sakaimachi Street",
          zh: "前往堺町通",
        },
        transport: {
          originId: "sankaku",
          destinationId: "sakaimachi",
        },
        placeId: "sakaimachi",
        kind: "walk",
      },
      {
        id: "street",
        time: "13:00–15:15",
        title: {
          en: "Sakaimachi, Kitaichi Glass, Music Box Museum & LeTAO",
          zh: "堺町通、北一硝子、小樽八音盒堂、LeTAO",
        },
        relatedPlaceIds: ["kitaichi", "music-box", "letao"],
        placeId: "sakaimachi",
      },
      {
        id: "canal",
        time: "15:30–16:45",
        title: {
          en: "Otaru Canal photography",
          zh: "小樽运河拍照",
        },
        placeId: "canal",
        note: {
          en: "Daylight → dusk → blue hour.",
          zh: "日光 → 黄昏 → 蓝调。",
        },
      },
      {
        id: "dinner",
        time: "17:00–18:15",
        title: {
          en: "Dinner in Otaru",
          zh: "小樽晚餐",
        },
        kind: "food",
      },
      {
        id: "return",
        time: "~18:30",
        title: {
          en: "Return to Sapporo",
          zh: "返回札幌",
        },
        transport: {
          originId: "otaru-station",
          destinationId: "sapporo-rail",
        },
        placeId: "sapporo-station",
        kind: "train",
      },
      {
        id: "home",
        time: "~19:30–20:00",
        title: {
          en: "Arrive in Sapporo & return to the Airbnb",
          zh: "抵达札幌、返回 Airbnb",
        },
        placeId: "susukino",
        kind: "stay",
      },
    ],
    note: {
      en: "Train times and mountain access are planning estimates. Check services and weather closer to travel.",
      zh: "列车及上山交通时间为规划参考，临近出行时请确认班次与天气。",
    },
  },
  {
    id: "dec-23",
    date: "2026-12-23",
    area: "Asahikawa / Biei",
    name: {
      en: "Klook winter day tour",
      zh: "Klook 冬季一日团",
    },
    nameJa: "旭川・美瑛",
    summary: {
      en: "Asahiyama Zoo · Biei · Blue Pond · Ningle Terrace",
      zh: "旭山动物园 · 美瑛 · 青池 · 森林精灵露台",
    },
    accommodationId: "susukino",
    items: [
      {
        id: "wake",
        time: "06:30",
        title: {
          en: "Wake up",
          zh: "起床",
        },
      },
      {
        id: "breakfast",
        time: "06:45–07:05",
        title: {
          en: "Breakfast",
          zh: "早餐",
        },
        kind: "food",
      },
      {
        id: "to-meeting",
        time: "07:05–07:30",
        title: {
          en: "Travel to the Sapporo TV Tower meeting point",
          zh: "前往札幌电视塔集合点",
        },
        transport: {
          originId: "susukino",
          destinationId: "tv-tower",
        },
        placeId: "tv-tower",
        kind: "walk",
      },
      {
        id: "meet",
        time: "~07:30",
        title: {
          en: "Meet at the TV Tower 1F Information Service Center",
          zh: "抵达札幌电视塔1楼信息服务中心",
        },
        placeId: "tv-tower",
        kind: "bus",
      },
      {
        id: "depart",
        time: "07:50",
        title: {
          en: "Klook day tour departs",
          zh: "Klook 一日团出发",
        },
        placeId: "tv-tower",
        kind: "bus",
      },
      {
        id: "zoo",
        time: "Morning",
        title: {
          en: "Asahiyama Zoo",
          zh: "旭山动物园",
        },
        timeLabel: {
          en: "Morning",
          zh: "上午",
        },
        placeId: "zoo",
      },
      {
        id: "biei",
        time: "Afternoon",
        title: {
          en: "Biei snowfields",
          zh: "美瑛雪原",
        },
        timeLabel: {
          en: "Afternoon",
          zh: "下午",
        },
        placeId: "biei",
      },
      {
        id: "falls",
        time: "Afternoon",
        title: {
          en: "Shirahige Falls",
          zh: "白须瀑布",
        },
        timeLabel: {
          en: "Afternoon",
          zh: "下午",
        },
        placeId: "falls",
      },
      {
        id: "blue-pond",
        time: "Afternoon",
        title: {
          en: "Shirogane Blue Pond",
          zh: "白金青池",
        },
        timeLabel: {
          en: "Afternoon",
          zh: "下午",
        },
        placeId: "blue-pond",
      },
      {
        id: "kamifurano",
        time: "Early evening",
        title: {
          en: "Kamifurano",
          zh: "上富良野",
        },
        timeLabel: {
          en: "Early evening",
          zh: "傍晚",
        },
        placeId: "kamifurano",
      },
      {
        id: "ningle",
        time: "Early evening",
        title: {
          en: "Ningle Terrace",
          zh: "森林精灵露台",
        },
        timeLabel: {
          en: "Early evening",
          zh: "傍晚",
        },
        placeId: "ningle",
      },
      {
        id: "return",
        time: "Evening",
        title: {
          en: "Return to Sapporo, dinner & rest",
          zh: "返回札幌、晚餐、休息",
        },
        timeLabel: {
          en: "Evening",
          zh: "晚上",
        },
        placeId: "susukino",
        kind: "stay",
      },
    ],
    note: {
      en: "Meet around 07:30 at Sapporo TV Tower, 1F Information Service Center, for the 07:50 departure. Confirm against your Klook voucher; the operator may adjust stop order and return time.",
      zh: "约07:30在札幌电视塔1楼信息服务中心集合，07:50出发。请与Klook凭证核对；景点顺序和返程时间可能由运营方调整。",
    },
  },
  {
    id: "dec-24",
    date: "2026-12-24",
    area: "Sapporo",
    name: {
      en: "Shopping & Shiroi Koibito Park",
      zh: "购物 + 白色恋人公园",
    },
    nameJa: "札幌",
    summary: {
      en: "Underground shopping · Chocolate park · Evening lights",
      zh: "地下街购物 · 白色恋人公园 · 夜间灯饰",
    },
    accommodationId: "susukino",
    items: [
      {
        id: "shop",
        time: "09:00–12:00",
        title: {
          en: "Sapporo underground shopping",
          zh: "札幌地下街购物",
        },
        placeId: "underground-shopping",
      },
      {
        id: "lunch",
        time: "12:00–13:00",
        title: {
          en: "Lunch",
          zh: "午餐",
        },
        kind: "food",
      },
      {
        id: "rest",
        time: "13:00–14:00",
        title: {
          en: "More shopping / drop bags at the Airbnb & rest",
          zh: "继续购物 / 返回 Airbnb 放东西、休息",
        },
        placeId: "susukino",
      },
      {
        id: "to-park",
        time: "14:00–14:45",
        title: {
          en: "Travel to Shiroi Koibito Park",
          zh: "前往白色恋人公园",
        },
        transport: {
          originId: "susukino",
          destinationId: "shiroi-koibito",
        },
        placeId: "shiroi-koibito",
        kind: "train",
      },
      {
        id: "park",
        time: "14:45–16:30",
        title: {
          en: "Visit the paid area of Shiroi Koibito Park",
          zh: "白色恋人公园付费区参观",
        },
        placeId: "shiroi-koibito",
      },
      {
        id: "cafe",
        time: "16:30–17:00",
        title: {
          en: "Shop, café & optional experience",
          zh: "商店 / 咖啡 / 可选体验",
        },
        placeId: "shiroi-koibito",
      },
      {
        id: "lights",
        time: "17:00–18:30",
        title: {
          en: "Evening illuminations, photos & souvenirs",
          zh: "夜间灯饰、拍照、购买伴手礼",
        },
        placeId: "shiroi-koibito",
      },
      {
        id: "return",
        time: "18:30–19:15",
        title: {
          en: "Return to central Sapporo",
          zh: "返回札幌市区",
        },
        transport: {
          originId: "shiroi-koibito",
          destinationId: "susukino",
        },
        placeId: "susukino",
        kind: "train",
      },
      {
        id: "dinner",
        time: "19:30–20:30",
        title: {
          en: "Dinner",
          zh: "晚餐",
        },
        kind: "food",
      },
    ],
    note: {
      en: "Check the park’s December opening hours, paid-area last admission and illumination schedule before travel. Optional experiences depend on availability.",
      zh: "出行前确认公园12月营业时间、付费区最后入场及灯饰开放时间；可选体验以实际可预约情况为准。",
    },
  },
  {
    id: "dec-25",
    date: "2026-12-25",
    area: "Tokyo",
    name: {
      en: "Sapporo → Tokyo",
      zh: "札幌 → 东京",
    },
    nameJa: "東京",
    summary: {
      en: "Early checkout · Jetstar GK124 · Narita T3 · Ikebukuro",
      zh: "提前退房 · 捷星GK124 · 成田T3 · 池袋",
    },
    accommodationId: "ikebukuro",
    items: [
      {
        id: "wake",
        time: "06:00–06:30",
        title: {
          en: "Wake up & pack",
          zh: "起床、整理行李",
        },
      },
      {
        id: "checkout",
        time: "06:30–07:00",
        title: {
          en: "Airbnb checkout & travel to Sapporo Station",
          zh: "Airbnb 退房、前往札幌站",
        },
        transport: {
          originId: "susukino",
          destinationId: "sapporo-rail",
        },
        placeId: "sapporo-rail",
        kind: "walk",
      },
      {
        id: "airbnb-to-airport",
        time: "07:00–08:00",
        title: {
          en: "Sapporo → New Chitose Airport",
          zh: "札幌 → 新千岁机场",
        },
        placeId: "cts",
        kind: "train",
        transferKey: "sapporo",
      },
      {
        id: "checkin",
        time: "08:00–09:40",
        title: {
          en: "Check-in, baggage drop & security",
          zh: "值机、托运、安检",
        },
        placeId: "cts",
      },
      {
        id: "flight",
        time: "10:20",
        title: {
          en: "Jetstar GK124 departs",
          zh: "Jetstar GK124 起飞",
        },
        flightId: "cts-nrt",
        placeId: "cts",
        kind: "flight",
      },
      {
        id: "arrival",
        time: "12:10",
        title: {
          en: "Arrive at Tokyo Narita Airport T3",
          zh: "抵达东京成田机场 T3",
        },
        placeId: "nrt",
      },
      {
        id: "narita-to-airbnb",
        time: "After arrival",
        title: {
          en: "Narita T3 → Ikebukuro Airbnb",
          zh: "成田T3 → 池袋民宿",
        },
        timeLabel: {
          en: "After arrival",
          zh: "抵达后",
        },
        placeId: "ikebukuro",
        kind: "train",
        transferKey: "tokyoArrival",
      },
      {
        id: "stay",
        time: "16:00+",
        title: {
          en: "Ikebukuro Airbnb check-in",
          zh: "入住池袋民宿",
        },
        placeId: "ikebukuro",
        kind: "stay",
      },
    ],
    note: {
      en: "Your updated plan reaches New Chitose at 08:00, 2 h 20 min before departure. The supplied flight document recommends 3 hours; confirm the airline’s check-in and baggage deadlines. The existing Narita-to-Airbnb transfer is retained after arrival.",
      zh: "更新计划08:00抵达新千岁，距起飞2小时20分；所提供航班文件建议提前3小时，请核实航司值机和托运截止时间。抵达后保留原有成田至民宿交通安排。",
    },
  },
] as (Omit<TripDay, "items"> & {
  items: (TimelineItem & { transferKey?: string })[];
})[];
const plannedDays: TripDay[] = [
  ...updatedDays.map((day) => ({
    ...day,
    items: day.items.map(({ transferKey, ...item }) =>
      transferKey ? { ...airportTransfers[transferKey], ...item } : item,
    ),
  })),
  ...[26, 27, 28].map((n) => ({
    id: `dec-${n}`,
    date: `2026-12-${n}`,
    area: "Tokyo" as const,
    name: l("Tokyo, to be planned", "东京，待规划"),
    accommodationId: "ikebukuro",
    nameJa: "東京",
    summary: l("A little room for discovery", "为探索留一点空间"),
    items: [],
    pending: true,
    note: l(
      "This day is intentionally open until the Tokyo itinerary is confirmed.",
      "东京行程确认前，此日暂留空白。",
    ),
  })),
  {
    id: "dec-29",
    date: "2026-12-29",
    area: "Tokyo",
    name: l("Onward to Wenzhou", "前往温州"),
    nameJa: "東京",
    summary: l(
      "Checkout · Narita T2 · Shanghai connection · Wenzhou",
      "退房 · 成田T2 · 上海中转 · 温州",
    ),
    accommodationId: "ikebukuro",
    note: l(
      "Flight times are local to each airport. Arrange checkout and the Narita transfer in time for the flight; the checkout deadline is not a recommended departure time.",
      "航班时间均为各机场当地时间。请按航班提前安排退房与成田机场交通，最晚退房时间不代表建议出发时间。",
    ),
    items: [
      stop(
        "checkout",
        undefined,
        "Check out & travel to Narita T2",
        "退房并前往成田T2",
        "ikebukuro",
        l(
          "Checkout by 11:00; plan to leave earlier as needed for airport check-in.",
          "最晚11:00退房，需根据机场值机安排提前离开。",
        ),
        "stay",
      ),
      {
        ...stop(
          "flight",
          "13:50",
          "Fly to Shanghai · MU524",
          "飞往上海 · MU524",
          "nrt-t2",
          l(
            "Narita T2 13:50 JST → Shanghai Pudong T1 16:30 CST",
            "成田T2 13:50日本时间 → 浦东T1 16:30中国时间",
          ),
          "flight",
        ),
        flightId: "nrt-pvg",
      },
      {
        ...stop(
          "connection",
          "18:05 CST",
          "Connect to Wenzhou · FM9527",
          "转机前往温州 · FM9527",
          undefined,
          l(
            "Pudong T1 18:05 → Wenzhou T2 19:30 (China time). Connection: 1 h 35 min; document states baggage checked through.",
            "浦东T1 18:05 → 温州T2 19:30（中国时间）。中转1小时35分钟，文件标注行李直挂。",
          ),
          "flight",
        ),
        flightId: "pvg-wnz",
      },
    ],
  },
];

export const itinerary: TripDay[] = plannedDays.map((day) => ({
  ...day,
  items: day.items.map((item) =>
    day.id === "dec-29" && item.id === "checkout"
      ? airportTransfers.tokyoDeparture
      : item,
  ),
}));
