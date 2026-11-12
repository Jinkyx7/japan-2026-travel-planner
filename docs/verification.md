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
