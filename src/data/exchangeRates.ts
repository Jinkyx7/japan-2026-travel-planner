import type { Currency } from "../types";
// Illustrative manual rates, not live quotes. Edit these before settling.
export const exchangeRates: {
  base: Currency;
  rates: Record<Currency, number>;
} = { base: "JPY", rates: { JPY: 1, NZD: 90, CNY: 21 } };
