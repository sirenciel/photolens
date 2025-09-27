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
2. Copy `.env.example` to `.env.local` and configure environment variables:
   * `GEMINI_API_KEY` – Gemini API key (existing requirement).
   * `VITE_API_BASE_URL` – Base URL of the backend REST API (defaults to `http://localhost:4000/api`).
3. Review the expected backend endpoints in [`docs/API_SPEC.md`](docs/API_SPEC.md) and ensure your server implements them.
4. Run the app:
   `npm run dev`
