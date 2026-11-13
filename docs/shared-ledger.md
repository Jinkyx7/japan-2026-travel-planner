# Shared trip ledger

## Access model

Public visitors can browse the itinerary, maps, food, shopping, bookings and general trip information. Only authenticated users whose verified email matches an active `trip_members` allowlist entry can read shared expenses and traveller names. Every active trip member can record/edit/delete any trip expense. Payer and participants are independent of the signed-in operator. Each expense records its creator, latest editor and server revision.

`trip_members` is not client-editable and only exposes the signed-in member's own row. Membership is never taken from user-editable metadata. Revoking the membership row blocks the next database request, even with an existing JWT. The client checks membership at sign-in, on return to the window and on reconnect. Signing out unmounts all ledger UI and removes the local session; private records are not cached by the service worker.

## Account provisioning

Create dedicated website accounts with Supabase Auth, normally through trusted administration (Auth Users / Admin API). Use an independent website password. This is unrelated to the user's mailbox password or the Supabase database password. Do not put plaintext passwords, admin keys or personal email allowlists in migrations, frontend bundles or Git. Do not enable public self-service membership.

The initial Jinky account was bootstrapped through the existing administrative database connection after inspecting the live Auth schema, creating one Auth user and matching email identity transactionally, without changing any existing account. A bcrypt hash was generated locally with a unique salt; the database received only that hash. This was a one-time setup, not a migration or a public signup endpoint. Future accounts should use the supported Auth admin workflow. Personal credentials are outside this repository in a local file restricted to its owner. They are not included in the build or this document.

Sign-in uses `signInWithPassword`, which does not send an email at each login. Email confirmation remains enabled at the provider level; the administrator-provisioned account is individually confirmed. Password changes use a temporary, non-persistent Auth client to verify the current password before updating the main session's account. Provider reauthentication requirements still apply: sign in again if the session is too old. No email recovery UI is offered until SMTP and recovery redirects are configured; contact the trip organiser for recovery.

## Environment and data

Use `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` in local and deployment build environments. Missing configuration locks the private ledger. Never use `service_role` or an `sb_secret_...` key in `VITE_` variables.

`src/services/expenses.ts` accesses Supabase directly under RLS. Database validation rejects invalid participants, duplicate participants, invalid split weights, fractional yen and fractional cents. Revisions prevent simultaneous edits/deletes from silently overwriting the latest transaction. Explicit import can migrate older device expenses in an atomic batch while skipping existing IDs. It keeps the original local copy. JSON export includes original amounts and manual FX settings.

Rates remain illustrative manual values in `src/data/exchangeRates.ts`; agree on rates before using settlement suggestions. Changing rate settings recalculates historical conversions. Offline write queuing, live exchange rates, receipt uploads and live Realtime subscriptions are outside this version.

## Linking payments to the itinerary

Every expense may optionally reference one `trip_expense_targets` catalog entry. Stay IDs include the place and check-in date; check-in and checkout stops use the same stay ID. Activity IDs include the day and stop, with Plan A/B preserved in their detail links. Multiple expenses can reference one item; they are still counted exactly once by the existing trip settlement calculation.

The form's **This payment completes the item's bill** checkbox is an explicit assertion, defaulting off. Without it, a linked payment is simply recorded, regardless of amount. A completing payment makes the linked item's status paid in full. Moving, unlinking or deleting that payment recalculates the old item's status from its remaining records. Changing the selected link resets the checkbox to prevent carrying a completion assertion to another item. No booking total or outstanding balance is invented. Amounts are summed separately by original currency.

Members can record payments directly from stay/activity details or select a link in the expense form. Detail pages show original amounts, dates and payers; **View / edit expenses** opens the ledger filtered to that item. Timeline badges reuse a single per-day query rather than fetching each row independently. Guests and signed-in nonmembers see neither actual payment records nor financial badges. Loading/error/offline states do not imply an item is unpaid.

The catalog is seeded by the `linked_expenses` migration and is read-only for clients. When adding or renaming itinerary IDs, append valid target IDs in a new migration before publishing the corresponding app data. Preserve referenced catalog rows for historical payments. `supabase/tests/linked_expenses.sql` checks references, explicit completion, relinking/unlinking and privacy in a rolled-back transaction.

## Verification

- Run `npm run build`, `npm test` and `npm run test:pwa` using Node 22+.
- Run `supabase/tests/member_access.sql` through a trusted SQL connection. It creates temporary fixtures in a transaction and rolls back all changes.
- The actual REST API should return 401/403 for anonymous reads of `trip_members`, `trip_travellers` and `trip_expenses`.
- Check the public itinerary while signed out, incorrect-password errors, member login, cloud persistence after reload, sign-out protection, Chinese/English labels and phone layouts.
- Never include passwords or session tokens in verification reports. Use clearly labelled test expenses and remove them after testing.

Website changes remain local until explicitly approved for publishing; the Supabase schema and initial account have been provisioned in the existing Japan-2026 project.
