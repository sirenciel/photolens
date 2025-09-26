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

## Backend & Database Roadmap

The current project only ships a frontend prototype backed by mock data. To evolve it into a full-stack product, see the [Photolens Backend Database Blueprint](docs/backend/database.md) for guidance on choosing a database (PostgreSQL), setting up Prisma migrations, and mapping each frontend entity to persistent tables.
