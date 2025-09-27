# Backend–Frontend Integration Review

## Summary
- The React shell loads and saves the consolidated application state through the Node server's `/api/state` endpoint, so high-level persistence is wired up.
- Client onboarding and edits now flow through `/api/clients`, letting the backend mint IDs, persist notes, and cascade deletions while other domains still mutate local arrays first.
- When the HTTP bridge is unavailable the UI immediately toggles into an offline mode and re-hydrates from the mock fixtures, so the product can run without the server but doesn't stay in sync.

## Evidence
### What already works
- `App.tsx` bootstraps its stores by calling `fetchAppState()` and replaces all local slices with the payload returned by the server, clearing the offline flag on success.【F:App.tsx†L40-L83】
- Whenever the in-memory snapshot changes and the UI is online, `persistAppState()` posts the serialised snapshot back to the backend, allowing the Node process to save it to disk.【F:App.tsx†L119-L164】【F:services/api.ts†L178-L214】
- `handleSaveClient` now calls `createClient`/`updateClient` helpers that in turn hit `/api/clients`, and client deletions invoke `DELETE /api/clients/:id` so the server recomputes derived totals and prunes related bookings/invoices.【F:App.tsx†L215-L307】【F:services/api.ts†L200-L266】【F:server/index.js†L18-L214】
- The backend exposes matching `GET`/`PUT /api/state` handlers that read and write the JSON file used to keep the app stateful between sessions.【F:server/index.js†L1-L214】

### What is still missing
- Bookings, invoices, expenses, and editing jobs still update purely in-memory; only the client domain talks to dedicated endpoints, so validation and ID generation for the other entities remain client-side.【F:App.tsx†L309-L672】【F:services/api.ts†L18-L266】
- Because the client falls back to mocks when the server is unreachable, users can diverge their local state from whatever is stored on disk until the next successful sync.【F:App.tsx†L83-L108】

## Recommendations
- Extend the new pattern to bookings, invoices, and editing jobs so the backend owns their IDs, validation, and cascading effects.
- Add authentication and permission checks server-side to mirror the role logic applied in the UI.
- Replace the mock fallback with lightweight optimistic queuing or at least a merge strategy so offline edits do not silently overwrite the persisted JSON snapshot.
