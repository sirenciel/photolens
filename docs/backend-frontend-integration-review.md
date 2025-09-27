# Backend–Frontend Integration Review

## Summary
- The React shell bootstraps its data stores through the Node server's `/api/state` endpoint and persists the full snapshot back through the same route, so global state saving/loading is wired up.
- Client onboarding, edits, and deletions call `/api/clients`, allowing the backend to mint IDs, recompute totals, and cascade removals when the integration path is online.
- When any call fails the UI flips into an offline mode and rehydrates from the mock fixtures, preserving usability at the cost of drifting away from the server snapshot until a resync succeeds.

## Evidence
### Working pieces
- `App.tsx` hydrates the app by calling `fetchAppState()` and replaces all local slices with the payload returned by the server, clearing the offline flag on success.【F:App.tsx†L50-L117】
- Whenever the in-memory snapshot changes and the UI is online, `persistAppState()` posts the serialised snapshot back to the backend so it can be saved to disk.【F:App.tsx†L119-L145】【F:services/api.ts†L202-L230】
- `handleSaveClient` now routes through `createClient`/`updateClient`, while deletions invoke `DELETE /api/clients/:id`, ensuring the server recomputes derived totals and prunes related bookings and invoices.【F:App.tsx†L235-L367】【F:services/api.ts†L232-L281】【F:server/index.js†L1-L214】

## Detailed gaps to fix
### Booking, invoice, and expense CRUD stay in the browser
- Booking and invoice handlers still mutate React state directly (`setBookings`, `setInvoices`) and fabricate IDs/timestamps locally instead of delegating to backend endpoints.【F:App.tsx†L369-L682】
- Expense creation and editing mirror that pattern, which means validation, deduping, and financial rollups never leave the browser runtime.【F:App.tsx†L684-L720】
- `services/api.ts` exposes only state snapshot and client helpers; there are no REST helpers for bookings, invoices, payments, or expenses yet.【F:services/api.ts†L18-L281】

### Automations and history are front-end only
- Automated invoice reminders run inside a `useEffect` and append activity feed entries on the client, so reminders are not scheduled or persisted server-side.【F:App.tsx†L147-L206】
- Activity history, editing workflow transitions, and dashboard metrics are derived in-memory; the backend merely stores whatever snapshot the UI last uploaded.【F:App.tsx†L50-L720】【F:server/index.js†L1-L214】

### Offline fallback can overwrite server truth
- When any API call throws, the app flags itself as offline, restores the mock fixtures, and keeps letting users mutate the in-memory arrays, but there is no merge strategy when connectivity returns.【F:App.tsx†L83-L117】【F:App.tsx†L235-L367】
- Because the next successful `persistAppState` pushes the full snapshot, any offline edits overwrite the server JSON with whatever the browser currently holds, even if another operator changed the file in the meantime.【F:App.tsx†L119-L145】【F:server/index.js†L1-L214】

## Recommended fixes
1. **Introduce real endpoints** for bookings, invoices, expenses, and editing jobs so the server, not the browser, owns ID generation, validation, and cascading effects.
2. **Move business automations** (invoice reminders, activity logging, editing job transitions) to the backend or at least to a shared job runner that the server controls.
3. **Design an offline sync strategy** such as queued mutations or diff-based merges to prevent the all-or-nothing snapshot upload from trampling concurrent edits.
4. **Harden the server** with authentication/authorization and input validation before exposing it beyond development environments.
