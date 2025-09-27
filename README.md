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
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key.
3. (Optional) Set `VITE_API_BASE_URL` in `.env.local` if your backend is hosted on a different URL.
4. Run the lightweight Node backend in a separate terminal:
   `node server/index.js`
5. Start the Vite dev server:
   `npm run dev`

When the backend is unavailable the UI will automatically fall back to the bundled mock data and run in offline mode. Any changes you make while offline remain in memory only; refresh the app after the API becomes reachable again to resync with the backend.
