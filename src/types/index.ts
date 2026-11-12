export type Language = "en" | "zh";
export type Localized = { en: string; zh: string };
export type Area =
  "Sapporo" | "Otaru" | "Jozankei" | "Asahikawa / Biei" | "Tokyo";
export type Place = {
  id: string;
  nameEn: string;
  nameZh: string;
  nameJa: string;
  nameRomaji?: string;
  category:
    | "attraction"
    | "restaurant"
    | "shopping"
    | "hotel"
    | "station"
    | "transport"
    | "photo";
  area: Area;
  coordinates?: { lat: number; lng: number };
  googleMapsUrl: string;
  website?: string;
  notes?: Localized;
};
export type Traveller = { id: string; displayName: string; color: string };
export type TimelineItem = {
  flightId?: string;
  id: string;
  time?: string;
  title: Localized;
  note?: Localized;
  placeId?: string;
  kind?: "train" | "flight" | "bus" | "walk" | "food" | "stay";
  transport?: {
    originId: string;
    destinationId: string;
    duration?: string;
    price?: string;
    confirmed?: boolean;
    passengers?: number;
  };
  plan?: "A" | "B";
};
export type TripDay = {
  id: string;
  date: string;
  area: Area;
  name: Localized;
  nameJa: string;
  summary: Localized;
  items: TimelineItem[];
  accommodationId?: string;
  pending?: boolean;
  note?: Localized;
};
export type Restaurant = {
  id: string;
  placeId: string;
  dish: Localized;
  meal: Localized;
  price?: string;
  choice: "primary" | "backup";
};
export type ShoppingItem = {
  id: string;
  nameEn: string;
  nameZh: string;
  nameJa: string;
  category: Localized;
  recommendedPlaces: string[];
  notes: Localized;
};
export type Currency = "JPY" | "NZD" | "CNY";
export type ExpenseCategory =
  "food" | "transport" | "accommodation" | "shopping" | "activities" | "other";
export type Expense = {
  id: string;
  category: ExpenseCategory;
  description: string;
  amount: number;
  currency: Currency;
  paidBy: string;
  date: string;
  participantIds: string[];
  shares?: Record<string, number>;
  note?: string;
};
