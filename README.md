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

## Share a temporary online preview

If you want to open the running dev server from another device or share a one-off link, you can expose the local Vite port through a tunnelling tool such as [localtunnel](https://github.com/localtunnel/localtunnel) (you can swap it for ngrok, Cloudflare Tunnel, etc.).

1. Start the Vite dev server on all interfaces so the tunnel can connect:
   `npm run dev -- --host 0.0.0.0 --port 5173`
2. In another terminal, install localtunnel if you do not have it yet:
   `npm install -g localtunnel`
3. Open the tunnel pointing at the Vite port:
   `lt --port 5173`
4. Copy the HTTPS URL that localtunnel prints and open it in your browser. You can share that link with collaborators while your dev server stays running.

> ℹ️  Tunnels are ephemeral. Every time you restart the tunnel a new URL is generated, and the link will stop working as soon as you stop either the tunnel process or the underlying dev server.
