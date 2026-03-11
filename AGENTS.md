# Repository Guidelines

## Project Structure & Module Organization
This repository is a Vite + React + TypeScript playground focused on TanStack Router and TanStack Query.
- `src/routes/`: route entry points, including public routes plus authenticated route groups under `_authenticated/`.
- `src/features/auth/`: auth-related API access, hooks, schema, and redirect/session handling.
- `src/features/tickets/`: ticket feature modules (`api`, `components`, `hooks`, `routes`, `schema`, `queryKeys`).
- `src/shared/`: cross-feature API client, UI helpers, environment config, and utilities (`api/*`, `ui/*`, `config/env.ts`, `utils/*`).
- `src/test/`: shared test fixtures.
- `src/mocks/`: MSW handlers and browser/node setup used in tests and local mocking.
- `public/`: static assets.
- `dist/`: build output (generated).
- `src/router.tsx`: router setup entrypoint.
- `src/routeTree.gen.ts`: generated file; do not hand-edit.
- In local environments, the backend is typically placed in a sibling directory whose name ends with `-backend`.
- When implementation depends on backend behavior or API contracts, inspect that sibling `-backend` project first to understand the backend specification before making frontend changes.

## Build, Test, and Development Commands
Use `pnpm` for all project commands.
- `pnpm install`: install dependencies.
- `pnpm prepare`: install lefthook git hooks.
- `pnpm dev`: start Vite dev server on port `3000`.
- `pnpm test`: run Vitest (`src/**/*.test.{ts,tsx}` in jsdom).
- `pnpm lint`: run Biome checks.
- `pnpm lint:fix`: apply Biome fixes.
- `pnpm typecheck`: run TypeScript check (`tsgo --noEmit`).
- `pnpm run ci`: run Biome CI checks.
- `pnpm build`: create production bundle.
- `pnpm preview`: build and serve the app locally with Wrangler.
- `pnpm deploy`: build and deploy with Wrangler.

## Coding Style & Naming Conventions
Biome is the source of truth for formatting and linting.
- 2-space indentation, LF, max line width 100.
- Single quotes, semicolons required, trailing commas enabled.
- Prefer named React imports (avoid default `React` import).
- Naming patterns: hooks as `useXxx.ts`, utilities as lower camelCase files, route/component files in PascalCase where appropriate.

## Testing Guidelines
Testing uses Vitest + Testing Library + jsdom.
- Place tests next to code as `*.test.ts` or `*.test.tsx`.
- Add/update tests for new feature logic, search-param handling, and bug fixes.
- `lefthook` pre-commit runs `pnpm lint` and `pnpm typecheck`; keep both passing before commit.
- Run `pnpm test`, `pnpm lint`, and `pnpm typecheck` before opening a PR.

## Commit & Pull Request Guidelines
Follow the existing commit style visible in history: `feat:`, `fix:`, `refactor:`, `chore:` with concise scopes.
- Example: `feat: add ticket pagination controls`.
- Keep commits small and focused.
- PRs should include: purpose, key changes, test evidence (command results), linked issue (if any), and screenshots for UI updates.
- Ensure GitHub Actions CI (lint + typecheck) passes before requesting review.

## Security & Configuration Tips
- Use `.env.example` as the baseline.
- Primary runtime variable is `VITE_API_BASE_URL`.
- Development typically points `VITE_API_BASE_URL` at `http://localhost:7080`; production uses the deployed backend URL.
- Login bootstrap users are configured on the backend side via `AUTH_BOOTSTRAP_*` environment variables.
- Do not commit secrets; keep environment-specific values in local `.env.*` files.
