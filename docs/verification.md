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

## Local PWA installation and offline support — 13 November 2026

- Added a stable root-scoped standalone manifest, 192/512px icons, a maskable icon, Apple touch icon and safe-area spacing. The mountain mark matches the existing favicon. More includes bilingual iOS/Android installation guidance and a native install button when the browser supplies an install prompt.
- A generated Workbox worker precaches all 43 app/manifest/icon/photo resources (about 12 MB). No Google scripts, tiles, external websites or API responses are cached. Deep links use the cached app shell. Map panels immediately use their place-list fallback when the browser reports offline and retry initialization on reconnect. Local expenses/checklists retain existing device-only storage behavior.
- Updates use prompt mode. A new worker waits until explicit acceptance; the app checks again on visible visits/reconnects. Later dismisses without navigating or reloading. Worker/manifest routes bypass the SPA rewrite and have revalidation headers for a future Vercel release.
- Actual browser offline check: waited for the saved-copy status, reloaded to establish worker control, stopped the preview server, confirmed curl failed (HTTP 000), then opened a previously unvisited `/itinerary/dec-22/stops/canal` URL. Its Chinese content and bundled photo rendered. Reloading that deep link with the server still stopped also succeeded.
- Actual update check: built a changed candidate, restarted the preview, and observed the Chinese update prompt. Later retained the same stop. On the next visit, Update now switched the loaded JS bundle to the new version. A final clean build removed the temporary verification marker and its update was also accepted.
- English/Chinese More pages and iOS/Android instructions reviewed at 390px, with no horizontal overflow. Manifest and touch-icon links were present. Service worker registration and initial caching had no console errors. Physical Android/iOS installation and OS-level airplane-mode events still require device validation after publishing.
- Strict build, 16 existing tests and 4 new built-PWA checks pass. The new checks cover real PNG dimensions, every bundled photo/asset, deep-link/API separation, hosting rewrite exclusions and explicit update activation. `npm audit --omit=dev` reports zero findings; full audit reports six low/moderate findings in transitive PWA build tools (no high/critical findings).
- Production service workers are intentionally disabled on Vite dev at port 5173. Use the running production preview at http://localhost:4173/more for local PWA review. No commit, push or deployment was performed.

## Member ledger and website password login — 13 November 2026

- Supabase tables and RLS are provisioned in the existing Japan-2026 project. The rolled-back SQL suite passed member CRUD, amount/participant/weight validation, creator/revision integrity, concurrent-edit rejection, nonmember isolation (including forged user metadata), membership revocation and guest denial. Supabase security advisors reported no findings.
- The actual REST API returns 401 for anonymous reads of each private table. A real password login verified the initial Jinky account, its member mapping and Traveller Jinky profile without exposing credentials or tokens in logs.
- Browser verification: the signed-out expenses route hides transactions and settlement tabs while the public itinerary remains accessible. Password login loaded the member ledger. A clearly labelled temporary expense was added through the form, survived a full reload, and was edited from JPY 9,000 to JPY 12,000. Settlement correctly showed JPY 4,000 each from the other two travellers. The test record was removed through the administrative database connection, and the UI returned to zero records after refresh.
- More exposes a current-password/new-password form for members. Current-password verification uses an isolated non-persistent Auth client before the main account update. The user's initial password was not changed during verification.
- Full strict production build, all 16 domain checks and 4 PWA checks passed. Private API responses remain excluded from the service worker cache. The earlier PWA entry's device-only expense storage description is superseded by the shared ledger; shopping and notes remain local.
- Website changes remain local; no commit, push or Vercel deployment was performed. See `shared-ledger.md` for account provisioning and operational limits.

## Payments linked to stays and itinerary stops — 13 November 2026

- Added a read-only, RLS-protected catalog of 74 valid stay/stop references, an optional FK on expenses and an explicit bill-completion flag. Existing expenses remain unlinked. A rolled-back SQL suite passed valid/invalid references, deposit defaults, explicit completion, revision integrity, relinking/unlinking and member/guest isolation. Actual anonymous REST requests to linked expenses and the catalog were denied.
- All 20 domain tests and 4 PWA checks passed, with a strict production build. New domain tests cover shared check-in/checkout targets, activity/day isolation, alternative-plan links, deposit/completion transitions, mixed original currencies and unchanged settlement totals.
- Browser flow: Record payment from Hotel Gracery details prefilled the stay and accommodation category. A JPY 5,000 deposit by Traveller Jinky remained simply recorded. A JPY 7,000 completing payment by Traveller 2 produced a JPY 12,000 total and paid-in-full status in stay details, its itinerary stop and the day's two relevant badges. Moving the completing payment to the TV Tower reset the form's completion assertion, changed the hotel's remaining status to recorded, and displayed the payment on the activity details after explicit completion. It was moved back for the screenshot; both labelled verification expenses were then removed.
- Chinese/English labels and the 390px card layout were reviewed. A separate unauthenticated origin could browse the hotel/day but had no payment section, payer name or timeline payment badge. The signed-in user's session was preserved.
- Security advisors found no table/RLS issues. The existing Auth setting for [leaked-password protection](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection) remains disabled; this unrelated account configuration was not changed by the feature.
- The screenshot `../linked-payments-local.png` is a clearly labelled temporary-data demonstration. No live test transactions remain. No commit, push or Vercel deployment was performed.

## CNY total and production release preparation — 13 November 2026

- Added a separately labelled CNY reference total alongside JPY. It converts original expense amounts using the existing manual rate table and rounds to cents, avoiding reuse of whole-yen settlement rounding. A synthetic regression case and existing accounting tests passed. All 21 domain checks and 4 PWA checks passed with a strict production build.
- Payer badges center their nickname; the member's current shared display name is Jinky. Actual expenses and account credentials remain outside the source repository. Only browser-safe Supabase URL/publishable configuration is supplied to the production build.
- The existing `js-studio3 / japan-2026-travel-planner` project and `main` repository branch are the release targets. This release includes the previously reviewed shared-ledger, password-login and linked-payment features.
