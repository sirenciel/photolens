# Integration Status

This document tracks how the frontend currently interacts with the lightweight backend that was introduced in the previous iteration.

## Working Pieces

- ✅ **Initial state bootstrap** – the React app now calls `fetchAppState()` during start-up and hydrates the UI with the data served by `GET /api/state`.
- ✅ **Global persistence** – every change that mutates the in-memory state triggers `persistAppState()`, which serialises the entire application snapshot and stores it via `PUT /api/state` on the Node server.
- ✅ **Offline awareness** – failures to reach the backend switch the UI into an offline mode that falls back to the bundled mock data.

## Still Missing

The bridge only shuttles a JSON snapshot between the browser and the Node process. All domain logic, validation, and relationships continue to live exclusively in the frontend:

- **Entity CRUD endpoints** – the server exposes only `/api/state`. React components still call helpers such as `handleSaveClient`, `handleSaveBooking`, and `handleSaveInvoice` (all in `App.tsx`), mutate local arrays, and then overwrite the entire state file. There are no RESTful resources like `/clients` or `/bookings`, so the backend cannot enforce constraints or generate IDs.
- **Authentication & authorisation** – `currentUser` is selected from the loaded staff list, permissions come from `services/permissions.ts`, and there is no login, token exchange, or server-side role enforcement. Anyone with the URL can read or replace the JSON payload.
- **Business workflows** – automated invoice reminders, editing job chaining, financial updates, and activity feed entries are executed within React effects and handlers. The backend neither schedules background jobs nor emits domain events.
- **Files & external services** – properties such as `driveFolderUrl`, proofing galleries, receipt uploads, or WhatsApp notifications are mocked. The server does not manage storage, webhooks, or third-party integrations.
- **Reporting & analytics** – charts on the dashboard and reports pages reuse the persisted aggregates (`revenueData`, `pandLData`, etc.). The backend never recomputes metrics from transactional records.
- **Concurrency & conflict handling** – because the client writes the whole snapshot, simultaneous editors would race and overwrite each other. There is no optimistic locking, change history, or diff-based merging.

## Next Steps

To move beyond the prototype, introduce real domain endpoints with validation, persist entities in a database, add authentication, and migrate critical workflows (reminder scheduling, invoice generation, expense tracking) to the server. Once those pieces exist, the frontend can drop the mock-data imports and rely solely on backend responses.
