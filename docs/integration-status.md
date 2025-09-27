# Integration Status

This document tracks how the frontend currently interacts with the lightweight backend that was introduced in the previous iteration.

## Working Pieces

- ✅ **Initial state bootstrap** – the React app now calls `fetchAppState()` during start-up and hydrates the UI with the data served by `GET /api/state`.
- ✅ **Global persistence** – every change that mutates the in-memory state triggers `persistAppState()`, which serialises the entire application snapshot and stores it via `PUT /api/state` on the Node server.
- ✅ **Offline awareness** – failures to reach the backend switch the UI into an offline mode that falls back to the bundled mock data.

## Still Missing

Even with the new HTTP bridge in place, several parts of the application remain frontend-only and have not been integrated with purpose-built backend logic:

1. **Entity-level APIs** – there are no REST endpoints for granular CRUD actions (e.g., `/clients`, `/bookings`). The frontend writes the whole state file for every change, so there is no server-side validation, deduplication, or conflict detection.
2. **Authentication & authorisation** – staff permissions are still derived from local enums; there is no login flow, no token exchange, and the backend serves the same state to any caller.
3. **Business workflows** – automated reminders, editing job transitions, financial calculations, and activity feeds execute entirely in the browser. The backend neither schedules tasks nor emits domain events.
4. **File and asset handling** – uploads such as photo galleries, receipts, or contracts are not supported. Paths like `driveFolderUrl` continue to be mock placeholders.
5. **Reporting & analytics** – charts and KPI widgets pull from mock aggregates that are persisted as-is. The backend does not recalculate revenue or profit/loss figures.
6. **Multi-user concurrency** – because updates overwrite the JSON snapshot, simultaneous editors would clobber each other’s changes. There is no locking, versioning, or real-time sync.

## Next Steps

To complete the integration, prioritise designing a real API surface (with routing, persistence, and validation), add authentication, and move critical workflows (reminder scheduling, invoice generation, expense tracking) server-side. Only then should the frontend stop importing the mock data entirely and rely solely on network responses.
