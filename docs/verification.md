# Verification

- `npm run build`: strict TypeScript checking and Vite production build passed.
- `npm test`: seven tests passed, covering equal/weighted splits, cross-currency totals, exact-yen rounding, settlement conservation, Japan date boundaries, all Place references, persistent repositories and storage failure reporting.
- `npm audit`: zero known vulnerabilities after replacing the original test runner with Node's test runner and tsx.
- Production browser review at 390 × 844: Home, Itinerary, Otaru Day Detail, Food, Map, Shopping, Expenses, Trip Info and More all rendered without horizontal overflow. Fresh production console had no warnings or errors.
- Desktop Home reviewed at 1440 × 1100.
- Browser interactions verified: add a test expense, edit its amount, reload to confirm persistence, inspect equal settlements, delete the test expense; toggle a shopping checkbox and reload; switch Christmas Eve to Plan B; switch English/Chinese; filter food to Otaru and verify matching places/cards. Test records were removed and the checklist reset.
- Screenshots: `screenshots/home-desktop.jpg`, `screenshots/home-mobile.jpg`.

Embedded Google Maps was not exercised with a real key because none was supplied. The no-key fallback and outbound place links were verified. API keys, referrer restrictions and billing are hosting configuration tasks. FX rates remain illustrative manual settings; Tokyo placeholder days remain intentionally open. No deployment or Git push was performed.

## Destination photos and stop details update

Added local destination photography with source/license credits, contextual stop detail routes, and food markers on combined day maps. Kept Notes. Verified hotel details in English/Chinese at 390px without overflow, direct detail reload, restaurant fallback selection, and Plan B preservation on return. Eight tests cover existing functionality plus deduplication and timeline-number preservation. Local map uses the no-key fallback; the live Google Maps path is checked after deployment.

## Accommodation and flight booking update — 12 November 2026

- Added four stays with check-in/out, room and bed information, meals, facilities, payment method notes and arrival guidance. Missing host instructions and unconfirmed details are explicitly marked.
- Added seven flight legs with airport-local dates/times, terminals and baggage notes. January return year is explicitly inferred, pending confirmation. Updated departure-day itinerary and linked stays from each day.
- Removed the Otaru illustration caption; retained licensed photography attribution.
- Booking PDFs remain outside the repository. No booking references, passenger identities, private apartment addresses, host contacts, access codes or payment amounts are included.
- Production build and all 11 tests passed. Tests cover continuous stay dates, flight references, Narita terminal differences, overnight dates and existing itinerary/expense/storage behavior.
- Mobile browser review at 390 × 844: accommodation navigation from itinerary, Hanamomiji details, Airbnb details, flight anchor navigation and expandable baggage notes. English/Chinese flight content has no horizontal overflow. Otaru caption absent; browser console has no errors.
- Earlier live Google Maps testing confirmed restaurant markers and selection. This update does not change map rendering.

## Language, airport transfers and stop photos — 12 November 2026

- First visit detects the browser's preferred language: zh locales use Chinese; other locales use English. Valid saved manual choices take precedence; storage failure still falls back to browser detection.
- Removed NZ0289 from the flight data and adjusted the displayed date range.
- Removed captions under daily itinerary heroes; attribution remains on a dedicated Photo credits page linked from More and desktop footer.
- Added 21 bundled Wikimedia photographs and a photo on every stop detail. Private stays and fallback views are marked as area views. Photo source, author and license metadata retained; all photos are historical views, not a promise of winter appearance.
- Added four airport ground transfers on 19, 25 and 29 December with step-by-step instructions and official JR Hokkaido, Keisei and Narita source links. No flight ground-directions links remain. Train times are not presented as booked; final Airbnb walks depend on the private host address.
- Build and 14 tests pass, including locale selection, transfer ordering, removed flight and photo asset coverage. Mobile Chinese transfer detail checked at 390 × 844: loaded photo and no horizontal overflow. Reviewed photo contact sheet for place relevance.

## Updated December itinerary and route audit — 13 November 2026

- Replaced 19–25 December schedules in English and Chinese, including Shiroi Koibito Park, the TV Tower tour meeting point, and airport check-in planning. Removed the old 24 December Plan A/B.
- 20 December now starts at 09:00; removed station shopping and preserved the 15:00 hotel shuttle. 21 December adds the Factory Atrium tree and 18:00 music/light show between Tanukikoji and dinner in Susukino.
- Google Maps links were opened and checked individually; see map-route-review.md. Corrected ambiguous street/private-stay references, separated the JR station from the north-exit meeting area, and removed public-transit links for reserved hotel shuttles.
- Grouped Otaru stops retain their related places on the map and in details. Long time ranges remain intact on mobile.
- Final production build and all 16 tests passed. English/Chinese browser review confirmed revised schedules, 18:00 show, matching directions links, and no horizontal overflow at 566px. Booking documents and private addresses remain outside the repository.

## Local Leaflet map trial — 13 November 2026 (superseded)

- Replaced the embedded Google SDK with stable Leaflet 1.9.4 and attributed OpenStreetMap raster tiles. Leaflet loads on demand; no Google Maps scripts or key are needed. Existing outbound Google Maps place/directions links remain unchanged.
- Reuses the map instance across area, language and selected-marker changes. Preserves the viewport through language changes; refits bounds on area changes and container resize. Numbering follows the shared Place list; restaurant icons retain their distinct colour and stacking order. Keyboard labels and zoom controls are bilingual.
- Browser checks: tiles render, zoom controls and dragging work, Otaru area filter, daily Otaru map, restaurant selection, English/Chinese selection-card updates, empty Tokyo restaurant map and recovery to Sapporo, and no horizontal overflow at 390px. Google Maps link on the selected restaurant is preserved. Fresh browser console has no errors.
- Production build and all 16 existing tests passed. The tile service is best-effort and must follow its usage policy; tile URL/attribution are configurable. This remains a local trial and has not been pushed or deployed.

## Google Maps restored and optimized locally — 13 November 2026

- Following the user's comparison, removed the Leaflet dependency, tile configuration and styles. Restored Google Maps using the existing ignored local browser key; no credential was printed or committed. Outbound place/directions URLs are unchanged.
- Map initialization is separate from marker updates. Each mounted panel keeps one map, shares one SDK script, reuses retained marker elements, and removes obsolete listeners/markers. Language and selection preserve viewport; area changes refit it. Added fractional zoom, a flat view, direct desktop wheel gestures, cooperative touch gestures, and resize handling. Marker click handlers follow Google's current accessible `gmp-click` API.
- Browser verification with the real local key: Google tiles loaded; Otaru filtering retained initialization count 1; zoom controls and dragging changed the viewport; switching Chinese/English preserved the exact center and zoom; LeTAO food marker opened its localized details/link. Tokyo's empty food map recovered to Sapporo with the same instance. The 21 December map showed all 8 markers. At 390px the page had no horizontal overflow, and one Google SDK script was present.
- Public Vercel `/map` and the 21 December Map tab both loaded tiles and markers without console errors during the read-only check; the previously reported production failure was not reproduced. No production configuration was changed.
- Production build and all 16 tests pass. Existing pending short bilingual timeline summaries are preserved. These changes are local only: no commit, push or deployment.
