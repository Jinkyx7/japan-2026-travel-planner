import type { Restaurant } from "../types";
export const restaurants: Restaurant[] = [
  {
    id: "garaku",
    placeId: "garaku",
    dish: { en: "Hokkaido soup curry", zh: "北海道汤咖喱" },
    meal: { en: "Lunch / dinner", zh: "午餐 / 晚餐" },
    choice: "primary",
  },
  {
    id: "shingen",
    placeId: "shingen",
    dish: { en: "Rich miso ramen", zh: "浓郁味噌拉面" },
    meal: { en: "Lunch / dinner", zh: "午餐 / 晚餐" },
    choice: "backup",
  },
  {
    id: "sankaku",
    placeId: "sankaku",
    dish: { en: "Seafood donburi", zh: "海鲜盖饭" },
    meal: { en: "Lunch", zh: "午餐" },
    choice: "primary",
  },
  {
    id: "letao",
    placeId: "letao",
    dish: { en: "Double Fromage cheesecake", zh: "双层芝士蛋糕" },
    meal: { en: "Café / dessert", zh: "咖啡 / 甜点" },
    choice: "backup",
  },
];
