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

Embedded maps use Google Maps JavaScript API and the same ordered place IDs as the timeline, with separate food icons. Add `VITE_GOOGLE_MAPS_API_KEY` to `.env.local` and restart Vite; configure the same variable in Vercel before deploying. Restrict the browser key to your development/production website URLs and the required APIs. `VITE_GOOGLE_MAPS_MAP_ID` is optional (defaults to Google's demo map ID).

The SDK is shared across panels. Each mounted panel keeps one map and reuses markers as filters or language change; language and selection preserve zoom/pan. Desktop wheel zoom is direct, while touch devices use cooperative gestures so the page remains scrollable. Initial tile loading and authorization failures fall back to the places list and outbound Google Maps links. Browser keys are visible in client code; never commit `.env.local`.

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

## Installable app and offline preview

Japan 2026 includes a PWA manifest, home-screen icons, standalone display, safe-area spacing and bilingual installation instructions under **More**. Android Chrome can show an Install button when supported. On iPhone/iPad, open in Safari and use Share → Add to Home Screen (enable Open as Web App when offered).

To test the actual service worker locally, run `npm run build`, then `npm run preview -- --port 4173` and open http://localhost:4173/more. The regular Vite development server intentionally does not enable offline caching, so development updates do not become stuck behind a worker.

Keep the app online until More reports that the offline copy is saved (roughly 12 MB). The app shell, bundled photos, itinerary, accommodation and flight data are precached, including deep links not previously visited. Google Maps scripts/tiles, external websites and APIs are never cached by our worker and require internet. Browser storage may be cleared or evicted; reopen online before travel. Personal expenses and checklists remain in this device's local storage, with no automatic cross-device sync.

Updates wait for the user to choose **Update now**; **Later** preserves the current session. Finish any unsaved form before updating. Registration checks again on a subsequent visible visit or reconnect. Vercel serves the worker/manifest directly with revalidation; no production deployment is needed to test locally.

`npm run test:pwa` checks the built manifest/icons, full photo and app-asset cache coverage, deep-link fallback, hosting routes, and explicit update activation. Run it after `npm run build`.
