# Repository Guidelines

## Project Structure & Module Organization
PhotoLens is a Vite + React 19 TypeScript app. Entry code in `index.tsx` mounts `App.tsx`, while UI modules live under `components/` with domain-specific subfolders. Shared hooks sit in `hooks/`, and domain logic sits in `services/` (Supabase client, data manager, and seed helpers). Database SQL lives in `database/`, shared types in `types.ts`, and Tailwind-driven styles in `src/styles.css`. Build artifacts land in `dist/`. Keep new features co-located with the relevant domain folder to preserve navigability.

## Build, Test, and Development Commands
- `npm install` syncs dependencies.
- `npm run dev` starts the Vite dev server on http://localhost:5173 using the Supabase instance configured in `.env.local`.
- `npm run build` creates an optimized production bundle in `dist/`.
- `npm run preview` serves the production build for local smoke testing.

## Coding Style & Naming Conventions
Use TypeScript, React functional components, and hooks for state. Follow the 4-space indentation, single quotes, and Tailwind-first styling seen in existing files. Name components and domain modules in PascalCase (`components/editing/EditingQueue.tsx`), hooks in camelCase (`useSupabaseClient`), and constants in SCREAMING_SNAKE_CASE. Extend `types.ts` when adding data contracts and reuse exported enums to avoid drift between UI and Supabase schemas.

## Testing Guidelines
Automated tests are not yet configured. Prioritize manual validation: run `npm run dev`, seed data with helpers in `services/seedData.ts`, and exercise flows against the Supabase project provisioned via `README-DATABASE-SETUP.md`. When adding coverage, prefer Vitest + React Testing Library, colocate specs alongside components (`components/.../__tests__/ComponentName.test.tsx`), and use the `*.test.tsx` suffix.

## Commit & Pull Request Guidelines
Keep commits focused and descriptive, mirroring the current history (for example, `Add Supabase backend integration - ...`). Start messages with an imperative verb and include a short scope tag (`feat:`, `fix:`) when useful. Pull requests should summarize changes, list user-visible impacts, reference related SQL updates in `database/`, and attach screenshots or screen recordings for UI work. Confirm the build command succeeds and call out any follow-up tasks before requesting review.

## Environment & Configuration
Store Supabase keys and secrets in `.env.local` and exclude them from version control. Update `tailwind.config.js`, `vite.config.ts`, or `tsconfig.json` only with clear rationale documented in the PR. When Supabase schema changes, export SQL into `database/` and note migration steps so reviewers can reproduce the environment.
