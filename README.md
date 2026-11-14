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

Embedded maps use Google Maps JavaScript API and the same ordered place IDs as the timeline. Numbered markers use a serving-dish silhouette for food, a house for accommodation and a pin for other stops; numbers sit inside each shape. The same SVGs appear in the offline list and legend. Add `VITE_GOOGLE_MAPS_API_KEY` to `.env.local` and restart Vite; configure the same variable in Vercel before deploying. Restrict the browser key to your development/production website URLs and the required APIs. `VITE_GOOGLE_MAPS_MAP_ID` is optional (defaults to Google's demo map ID).

The SDK is shared across panels. Each mounted panel keeps one map and reuses markers as filters or language change; language and selection preserve zoom/pan. Desktop wheel zoom is direct, while touch devices use cooperative gestures so the page remains scrollable. Initial tile loading and authorization failures fall back to the places list and outbound Google Maps links. Browser keys are visible in client code; never commit `.env.local`.

## Features

- Eleven day itinerary, with curated English / Chinese / Japanese place names.
- Confirmed shuttle information, flight details, Otaru timeline, guided tour and switchable December 24 plans.
- Tokyo December 26–29 intentionally left unplanned.
- Maps filter by region and allow multiple place types together: food/cafés, things to do, accommodation and airports. All types resets the category selection. Things to do includes shopping and ground transport. Numbered yellow rice bowls, houses and airplane silhouettes distinguish the main categories. Shopping supports product/place views; daily notes are local.
- Editable expenses with original JPY/NZD/CNY amounts, payer and participant selection, filters, totals and settlement suggestions.
- Expenses can link to a stay or itinerary stop. Member-only details and timeline badges show payers and recorded payments; paid-in-full status is explicit, so deposits aren't mistaken for completed bills.
- Total trip spending shows both JPY and an approximate CNY equivalent using the shared manual rates, with CNY calculated directly from original-currency payments.
- Member-only shared expenses and traveller names, with email/password login and password changes under More.
- Accessible forms and native modal dialog, responsive layout, desktop navigation and mobile bottom navigation.
- Mobile bottom navigation prioritizes Home, Itinerary, Map and Expenses; Food and Shopping are available under More.

## Data and persistence

`src/data/` owns itinerary, places, restaurants, shopping, travellers and manual exchange rates. Content is separate from JSX. Types are in `src/types/index.ts`.

The itinerary, maps and other travel pages are public. `/expenses` requires a Supabase Auth session and an active row in `trip_members`. Signing in alone does not grant membership. The database enforces access with RLS; clients cannot add members or edit their permissions. Account creation and resets are administrator tasks; there is no public registration form. Members can change their website password under **More** by entering their current password.

Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` in `.env.local`. Only use a publishable key here; never use a secret or service-role key in the frontend. `src/services/expenses.ts` saves shared expenses to Supabase and detects stale edits using row versions. Travellers and their nicknames are also shared. Expenses start empty. Entries refresh on return to the app, reconnect, or the Refresh button; this is not a live Realtime subscription.

Shopping checklists and daily notes still use this browser's local storage with the `japan2026:v1:` prefix. Clearing browser data removes those local records. Legacy expense storage is only read after member access succeeds; members can explicitly import existing device records without deleting their originals. Repeated imports skip existing IDs. Export backup downloads JSON with all currently loaded expenses, travellers and the manual rate settings; it does not send payments.

The schema migration is in `supabase/migrations/`. Seed the personal email allowlist through trusted administration, not a committed migration. `supabase/tests/member_access.sql` verifies member CRUD, validation, optimistic updates, guest/nonmember isolation and revocation in a rolled-back transaction. See `docs/shared-ledger.md` for setup and verification details.

Rates in `src/data/exchangeRates.ts` are illustrative manual settings (JPY base, NZD 90, CNY 21). Confirm and edit them before settling. Member balances and settlement suggestions use CNY: each original-currency transaction is converted directly to integer cents, then largest-remainder allocation ensures shares sum to the converted amount. Trip totals independently show JPY and CNY, rounding only the final display totals. The model supports weighted custom shares; the V1 form uses equal shares. Settlement suggestions do not send payments.

Trip progress uses Japan's calendar date. Timetable estimates, unconfirmed activities and unspecified return times are labeled rather than invented. No booking codes or private contact details are included. Accommodation pins represent the supplied public hotel or general area, not private addresses. Restaurant ratings/prices are omitted when unverified.

## Deploy to Vercel

Import this GitHub repository in Vercel. Choose Vite; build command `npm run build`, output `dist`, Node 22+. Add the map and Supabase frontend environment variables before building. `vercel.json` provides SPA rewrites so day-detail deep links load directly. The public travel pages work without a backend; the shared ledger needs the Supabase schema and Auth accounts. When Supabase configuration is missing, the ledger remains locked. Commit/push/deploy only when explicitly requested.

## Visual assets

`public/images/otaru-winter.jpg` is an AI-generated editorial winter canal scene inspired by Otaru, created with the built-in image generation tool, not documentary photography. The generation prompt is in `docs/hero-prompt.md`. UI icons use Lucide. No runtime image service is required.

## Installable app and offline preview

Japan 2026 includes a PWA manifest, home-screen icons, standalone display, safe-area spacing and bilingual installation instructions under **More**. Android Chrome can show an Install button when supported. On iPhone/iPad, open in Safari and use Share → Add to Home Screen (enable Open as Web App when offered).

To test the actual service worker locally, run `npm run build`, then `npm run preview -- --port 4173` and open http://localhost:4173/more. The regular Vite development server intentionally does not enable offline caching, so development updates do not become stuck behind a worker.

Keep the app online until More reports that the offline copy is saved (roughly 12 MB). The app shell, bundled photos, itinerary, accommodation and flight data are precached, including deep links not previously visited. Google Maps scripts/tiles, external websites and Supabase responses are never cached by our worker and require internet. Browser storage may be cleared or evicted; reopen online before travel. The shared ledger requires internet; offline writes and automatic offline syncing are not implemented. Checklists remain local to the device.

Updates wait for the user to choose **Update now**; **Later** preserves the current session. Finish any unsaved form before updating. Registration checks again on a subsequent visible visit or reconnect. Vercel serves the worker/manifest directly with revalidation; no production deployment is needed to test locally.

`npm run test:pwa` checks the built manifest/icons, full photo and app-asset cache coverage, deep-link fallback, hosting routes, and explicit update activation. Run it after `npm run build`.
