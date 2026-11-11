import type { ShoppingItem } from "../types";
export const shoppingItems: ShoppingItem[] = [
  [
    "shiroi",
    "Shiroi Koibito",
    "白色恋人",
    "白い恋人",
    ["tanukikoji", "sapporo-station", "cts"],
  ],
  [
    "royce",
    "ROYCE’ Nama Chocolate",
    "ROYCE 生巧克力",
    "ロイズ 生チョコレート",
    ["sapporo-station", "cts"],
  ],
  [
    "jaga",
    "Jaga Pokkuru",
    "薯条三兄弟",
    "じゃがポックル",
    ["tanukikoji", "cts"],
  ],
  [
    "rokkatei",
    "Marusei Butter Sandwich",
    "六花亭奶油夹心饼干",
    "マルセイバターサンド",
    ["sapporo-station", "cts"],
  ],
  ["letao", "LeTAO souvenirs", "LeTAO 伴手礼", "ルタオ", ["letao", "cts"]],
  ["music", "Otaru Music Box", "小樽八音盒", "小樽オルゴール", ["music-box"]],
  ["glass", "Kitaichi Glass", "北一硝子玻璃制品", "北一硝子", ["kitaichi"]],
].map(([id, nameEn, nameZh, nameJa, recommendedPlaces], i) => ({
  id: id as string,
  nameEn: nameEn as string,
  nameZh: nameZh as string,
  nameJa: nameJa as string,
  recommendedPlaces: recommendedPlaces as string[],
  category:
    i < 5
      ? { en: "Sweet things", zh: "美味伴手礼" }
      : { en: "Little keepsakes", zh: "旅行纪念品" },
  notes:
    i === 1
      ? {
          en: "Keep chilled; buy close to departure.",
          zh: "需冷藏，建议临近返程时购买。",
        }
      : { en: "Availability varies by shop.", zh: "库存以店铺实际情况为准。" },
}));
