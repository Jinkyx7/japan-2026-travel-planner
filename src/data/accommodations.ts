import type { Localized } from "../types";
const l = (en: string, zh: string): Localized => ({ en, zh });
export type Accommodation = {
  placeId: string;
  checkInDate: string;
  checkOutDate: string;
  checkIn: Localized;
  checkOut: string;
  room: Localized;
  beds: Localized;
  guests: Localized;
  meals: Localized;
  amenities: Localized;
  arrival: Localized[];
  payment: Localized;
  notices: Localized[];
};
// Only travel-useful fields from supplied confirmations. No guest identities,
// private apartment addresses, booking IDs, contacts, or access instructions.
export const accommodations: Accommodation[] = [
  {
    placeId: "gracery",
    checkInDate: "2026-12-19",
    checkOutDate: "2026-12-20",
    checkIn: l("From 14:00", "14:00 起"),
    checkOut: "11:00",
    room: l("1 Standard Triple Room · Non-smoking", "1 间标准三人间 · 禁烟"),
    beds: l("3 single beds · 90–130 cm wide", "3 张单人床 · 宽 90–130 厘米"),
    guests: l("3 adults", "3 位成人"),
    meals: l("No meals included", "不含餐食"),
    amenities: l(
      "Private bathroom, air conditioning, heating, free Wi-Fi, refrigerator, kettle, hairdryer, towels and toiletries; upper floors accessible by elevator.",
      "独立浴室、空调、暖气、免费 Wi-Fi、冰箱、电热水壶、吹风机、毛巾及洗浴用品；高层可乘电梯抵达。",
    ),
    arrival: [
      l(
        "Address: Chuo-ku Kita 4-jo Nishi 4-1, Sapporo 060-0004. Japanese: 札幌市中央区北4条西4丁目1.",
        "地址：札幌市中央区北4条西4丁目1，邮编 060-0004。",
      ),
      l(
        "Bring your booking confirmation and your preferred payment method. The confirmation printout can be used at check-in.",
        "携带预订确认单及付款方式；打印的确认单可用于办理入住。",
      ),
    ],
    payment: l(
      "Pay at the property in JPY; no prepayment required. Accommodation tax is payable separately at the property.",
      "到店以日元付款，无需预付；住宿税需另行在酒店支付。",
    ),
    notices: [],
  },
  {
    placeId: "hanamomiji",
    checkInDate: "2026-12-20",
    checkOutDate: "2026-12-21",
    checkIn: l("Planned arrival 16:00", "预计 16:00 抵达"),
    checkOut: "10:00",
    room: l(
      "1 Casual Japanese-style room · 45 m²",
      "1 间 Casual 日式客房 · 45 平方米",
    ),
    beds: l(
      "Bedding configuration not specified in the confirmation",
      "确认单未注明具体床铺配置",
    ),
    guests: l("3 guests", "3 位住客"),
    meals: l(
      "Dinner and breakfast included · Basic kaiseki “SHIORI”",
      "含晚餐及早餐 · 基础怀石料理「SHIORI」",
    ),
    amenities: l(
      "Onsen stay; individual room facilities are not itemized in the confirmation.",
      "温泉住宿；确认单未逐项列出客房设施。",
    ),
    arrival: [
      l(
        "Planned arrival is 16:00 after the shuttle from Sapporo. This is the arrival time entered in the reservation, not the hotel's general check-in opening time.",
        "预订填写的预计抵达时间为乘札幌接驳车后 16:00；这不是酒店统一开始办理入住的时间。",
      ),
      l(
        "Existing trip plan: confirmed shuttle at 15:00 on 20 Dec from JR Sapporo Station North Exit; return at 10:00 on 21 Dec. Both for 3 passengers.",
        "既有行程：12月20日15:00 从 JR 札幌站北口乘已确认的接驳车；12月21日10:00 返回，均为3人。",
      ),
      l(
        "Bring a printout of the reservation email. Let the hotel know through your booking if your planned arrival changes.",
        "携带预订邮件打印件；若预计抵达时间改变，请通过预订渠道告知酒店。",
      ),
    ],
    payment: l(
      "Pay on site. Bathing tax and accommodation tax are excluded and payable at the facility.",
      "到店付款；入汤税及住宿税未包含，需在酒店支付。",
    ),
    notices: [],
  },
  {
    placeId: "susukino",
    checkInDate: "2026-12-21",
    checkOutDate: "2026-12-25",
    checkIn: l("From 15:00", "15:00 起"),
    checkOut: "10:00",
    room: l(
      "1-bedroom Airbnb · listing advertises capacity for 4",
      "1 卧室 Airbnb · 房源标题标注可住4人",
    ),
    beds: l("Bed types and bed count not specified", "未注明床型及床铺数量"),
    guests: l(
      "Confirmation lists 1 guest — verify for the 3-person trip",
      "确认单列出1位住客，请核实是否已包含同行3人",
    ),
    meals: l("Not specified in the confirmation", "确认单未注明"),
    amenities: l(
      "Listing mentions air conditioning, Wi-Fi and a nearby 7-Eleven. Other facilities need the listing or host guide.",
      "房源标题提及空调、Wi-Fi 及附近的 7-Eleven；其他设施需查看房源页面或房东指南。",
    ),
    arrival: [
      l(
        "Listing describes a roughly 9-minute walk from Susukino. The public map shows the area only; use your Airbnb reservation for the exact building and apartment.",
        "房源标题说明距薄野步行约9分钟。公开地图仅显示地区；具体楼栋及房号请查看 Airbnb 预订。",
      ),
      l(
        "Key collection, entry method, luggage storage and step-by-step directions are not included in this PDF. Get the host's arrival guide before travel.",
        "此 PDF 不含取钥匙、入门方式、行李寄存及详细抵达路线；请在出发前获取房东入住指南。",
      ),
    ],
    payment: l(
      "Use Airbnb for payment status and booking changes.",
      "付款状态与预订修改请查看 Airbnb。",
    ),
    notices: [
      l(
        "Check out before the airport transfer on 25 Dec. The flight leaves New Chitose at 10:20; 10:00 is the accommodation checkout deadline, not a suitable airport departure time.",
        "12月25日前往机场前需退房。航班10:20从新千岁起飞；10:00是住宿最晚退房时间，并非适合出发去机场的时间。",
      ),
    ],
  },
  {
    placeId: "ikebukuro",
    checkInDate: "2026-12-25",
    checkOutDate: "2026-12-29",
    checkIn: l("From 16:00", "16:00 起"),
    checkOut: "11:00",
    room: l(
      "3LDK Airbnb · 3 bedrooms with living/dining/kitchen space",
      "3LDK Airbnb · 3卧室及客餐厅、厨房空间",
    ),
    beds: l("Bed types and bed count not specified", "未注明床型及床铺数量"),
    guests: l(
      "Confirmation lists 1 guest — verify for the 3-person trip",
      "确认单列出1位住客，请核实是否已包含同行3人",
    ),
    meals: l("Not specified in the confirmation", "确认单未注明"),
    amenities: l(
      "The confirmation identifies a 3LDK guest house; other amenities are not itemized.",
      "确认单标注为3LDK民宿，未逐项列出其他设施。",
    ),
    arrival: [
      l(
        "Listing describes a roughly 9-minute walk near JR Ikebukuro Station. Use the Airbnb reservation and host guide for the exact address and route; the public map is area-level only.",
        "房源标题说明在 JR 池袋站附近，步行约9分钟。具体地址及路线请查看 Airbnb 预订及房东指南；公开地图仅显示地区。",
      ),
      l(
        "Entry instructions, key collection and luggage storage are not included in this PDF. Request the host's arrival guide before travel.",
        "此 PDF 未提供入门方式、取钥匙及行李寄存说明；请在出发前获取房东入住指南。",
      ),
    ],
    payment: l(
      "Use Airbnb for payment status and booking changes.",
      "付款状态与预订修改请查看 Airbnb。",
    ),
    notices: [
      l(
        "On 29 Dec, plan checkout and airport travel around the 13:50 flight from Narita Terminal 2. The 11:00 checkout deadline is not an airport-transfer recommendation.",
        "12月29日需根据13:50从成田第2航站楼起飞的航班安排退房及交通；11:00的最晚退房时间并非机场出发建议。",
      ),
    ],
  },
];
export const accommodationByPlace = Object.fromEntries(
  accommodations.map((stay) => [stay.placeId, stay]),
);
