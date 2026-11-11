# Japan 2026

A responsive family travel companion for Hokkaido and Tokyo, 19–29 December 2026. Built in this repository with React, Vite, TypeScript, Tailwind CSS, React Router and Lucide icons.

## Run locally

Use Node.js 22 or newer (a `.nvmrc` is included).

```sh
npm ci
cp .env.example .env.local
npm run dev
```

Open the URL printed by Vite. `npm run build` performs a strict TypeScript check and creates `dist/`. `npm test` checks settlement math, rounding, date boundaries, shared data references and storage behavior.

## Maps

The app works without credentials: each map panel lists its places with Google Maps outbound links. To enable embedded maps, set `VITE_GOOGLE_MAPS_API_KEY` in `.env.local` or your hosting environment and enable Maps JavaScript API in the Google Cloud project. Restrict the browser key by HTTP referrer and API. `VITE_GOOGLE_MAPS_MAP_ID` accepts your map ID; `DEMO_MAP_ID` is the development default.

Uses Google's [JavaScript API loader](https://developers.google.com/maps/documentation/javascript/load-maps-js-api) and advanced markers. Markers and timeline stops share ordered place IDs. Network, timeout and authentication errors retain the outbound-link experience. A live API key was not supplied, so the live Google map path needs verification with your configured project.

## Features

- Eleven day itinerary, with curated English / Chinese / Japanese place names.
- Confirmed shuttle information, flight details, Otaru timeline, guided tour and switchable December 24 plans.
- Tokyo December 26–29 intentionally left unplanned.
- Food filters, maps, shared places, shopping by product or place, and daily notes.
- Editable expenses with original JPY/NZD/CNY amounts, payer and participant selection, filters, totals and settlement suggestions.
- Traveller nicknames editable in Trip information.
- Accessible forms and native modal dialog, responsive layout, desktop navigation and mobile bottom navigation.

## Data and persistence

`src/data/` owns itinerary, places, restaurants, shopping, travellers and manual exchange rates. Content is separate from JSX. Types are in `src/types/index.ts`.

`src/services/storage.ts` defines asynchronous `ExpenseRepository` and `ShoppingRepository` interfaces. Replace the exported localStorage implementations with Supabase implementations later; UI callers can retain the same methods. Browser-local records use the `japan2026:v1:` prefix. Data is **per browser/device**, not synchronized across family members. Clearing browser data removes it. Expenses start empty, not with sample transactions.

Rates in `src/data/exchangeRates.ts` are illustrative manual settings (JPY base, NZD 90, CNY 21). Confirm and edit them before settling. Conversion rounds each transaction to whole base-currency yen; largest-remainder allocation ensures shares sum to the converted amount. The model supports weighted custom shares; the V1 form uses equal shares. Settlement suggestions do not send payments.

Trip progress uses Japan's calendar date. Timetable estimates, unconfirmed activities and unspecified return times are labeled rather than invented. No booking codes or private contact details are included. Accommodation pins represent the supplied public hotel or general area, not private addresses. Restaurant ratings/prices are omitted when unverified.

## Deploy to Vercel

Import this GitHub repository in Vercel. Choose Vite; build command `npm run build`, output `dist`, Node 22+. Add the optional map environment variables. `vercel.json` provides SPA rewrites so day-detail deep links load directly. No server, database or authentication is required.

## Visual assets

`public/images/otaru-winter.jpg` is an AI-generated editorial winter canal scene inspired by Otaru, created with the built-in image generation tool, not documentary photography. The generation prompt is in `docs/hero-prompt.md`. UI icons use Lucide. No runtime image service is required.
