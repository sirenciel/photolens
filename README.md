<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1NksvyaEmdqRcALjlGF4KjmeeUhab89OL

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Create a `.env.local` file (or update the existing one) with the following variables:

   ```bash
   # Gemini integration used by some AI-assisted UI features
   GEMINI_API_KEY="your-google-gemini-key"

   # Base URL for the backend API that powers LensLedger data
   VITE_API_BASE_URL="http://localhost:4000"
   ```

   > ℹ️  `VITE_API_BASE_URL` should point to the publicly reachable origin of your backend service. The value is consumed by the API client (`services/api.ts`) to build every request URL. Trailing slashes are trimmed automatically.

3. Run the app:
   `npm run dev`

## API Usage

The frontend communicates with the backend exclusively through the helpers defined in [`services/api.ts`](services/api.ts). The `fetchJson` wrapper centralises JSON parsing and error handling, while the exported functions map 1:1 to backend endpoints (clients, bookings, invoices, expenses, editing jobs, reports, settings, automations, etc.).

Example usage inside React components:

```ts
import * as api from './services/api';

async function loadClients() {
  const clients = await api.getClients();
  // Convert date strings to Date objects or normalise data here as needed
}

async function createInvoice(payload: Partial<Invoice>) {
  const invoice = await api.createInvoice(payload);
  // Update local state with the API response
}
```

All CRUD handlers and automation triggers in `App.tsx` call these helpers and update component state based on the server responses. When adding new endpoints, follow the existing pattern (define a helper in `services/api.ts`, consume it in `App.tsx`, and propagate async handlers down to child components).
