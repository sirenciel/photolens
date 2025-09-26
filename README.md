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
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Backend API (server)

The repository now includes a Node.js + TypeScript + Express backend in [`server/`](server/).

1. Install dependencies: `cd server && npm install`
2. Configure the database connection in [`server/.env`](server/.env). By default it targets a local PostgreSQL instance named `photolens`.
3. Generate the Prisma client and apply the schema: `npx prisma generate` then `npx prisma migrate dev`.
4. Seed the database with the mock data used in the UI: `npm run seed`.
5. Start the API server: `npm run dev` (or `npm run start` after building with `npm run build`).

The seed script reuses the fixtures defined in [`services/mockData.ts`](services/mockData.ts) so that the backend reflects the same initial dataset as the front-end mock data.
