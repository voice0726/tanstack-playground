# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Vite + React + TypeScript playground focused on TanStack Router and TanStack Query. UI library is Mantine v8 (primary color: teal). Deployed to Cloudflare Workers via Wrangler (SPA mode, `dist/` directory).

The backend lives in a sibling directory ending with `-backend`. When implementation depends on backend behavior or API contracts, inspect that sibling project first.

## Commands

- `pnpm dev` — start dev server on port 3000
- `pnpm test` — run Vitest (jsdom, `src/**/*.test.{ts,tsx}`)
- `pnpm test -- src/path/to/file.test.ts` — run a single test file
- `pnpm lint` — Biome check
- `pnpm lint:fix` — Biome auto-fix
- `pnpm typecheck` — TypeScript check via `tsgo --noEmit`
- `pnpm build` — production build
- `pnpm preview` — build + serve locally with Wrangler

Pre-commit hook (lefthook) runs `pnpm lint` and `pnpm typecheck` in parallel. Both must pass before commit.

## Architecture

### Routing

TanStack Router with file-based routing (`src/routes/`). Route tree is auto-generated in `src/routeTree.gen.ts` — **do not hand-edit**. The router plugin uses `autoCodeSplitting: true`.

- `src/routes/__root.tsx` — root layout with MantineProvider, AppShell, header (logo, nav links, user info), devtools
- `src/routes/_authenticated.tsx` — layout route that guards child routes via `beforeLoad` session check; redirects to `/` if unauthenticated
- `src/routes/index.tsx` — home page with login form and auth state display
- `src/routes/_authenticated/tickets/index.tsx` — ticket list with search, pagination, delete modal; uses `stripSearchParams`
- `src/routes/_authenticated/tickets/new.tsx` — create ticket page
- `src/routes/_authenticated/tickets/$ticketId/index.tsx` — ticket detail; uses `remountDeps` to remount on param change
- `src/routes/_authenticated/tickets/$ticketId/edit.tsx` — edit ticket page

Route components are thin wrappers in `src/routes/` that delegate to feature-level route components in `src/features/*/routes/`.

### Feature Modules (`src/features/`)

Each feature follows this structure:
- `api.ts` — fetch functions using the shared HTTP client
- `schema/` — Zod schemas for validation and type inference
- `hooks/` — TanStack Query hooks (queries + mutations)
- `components/` — React components organized by concern
- `routes/` — route-level components that compose hooks + components
- `queryKeys.ts` — query key factory pattern for cache management

#### Auth (`src/features/auth/`)

- `api.ts` — `fetchCurrentUser()`, `login()`, `logout()`
- `schema.ts` — `authUserSchema`, `authResponseSchema`, `loginRequestSchema`
- `queryKeys.ts` — `authQueryKey.all`, `authQueryKey.session()`
- `hooks/` — `useAuthSession()`, `useLogin()`, `useLogout()`
- `components/AuthRedirectController.tsx` — subscribes to the query cache; on any `UnauthorizedError` across queries or mutations, clears all cache data and redirects to home

#### Tickets (`src/features/tickets/`)

- `api.ts` — full CRUD: `fetchTickets()`, `fetchTicket()`, `createTicket()`, `updateTicket()`, `deleteTicket()`, plus comment CRUD: `createTicketComment()`, `updateTicketComment()`, `deleteTicketComment()`
- `schema/index.ts` — `ticketActorSchema`, `ticketsSchema`, `ticketDetailSchema`, request/response schemas
- `schema/search.ts` — `ticketsSearchSchema`, `TICKETS_SEARCH_DEFAULT` (q, status, sortBy, sortOrder, page, pageSize); fields use `.catch()` for safe fallback defaults
- `schema/form.ts` — `ticketFormValuesSchema`, `ticketCommentFormValuesSchema`
- `queryKeys.ts` — `ticketsQueryKey.all/lists()/list(filter)/detail(id)` with staleTime 30 s, gcTime 5 min; `updateTicketDetailCache()` helper updates detail cache and invalidates list queries
- `hooks/` — `useTickets()`, `useTicket()`, `useCreateTicket()`, `useUpdateTicket()`, `useDeleteTicket()`, `useCreateTicketComment()`, `useUpdateTicketComment()`, `useDeleteTicketComment()`
- `components/forms/` — `TicketForm.tsx` (react-hook-form + Zod, `Controller` for Select inputs)
- `components/list/` — `TicketsListPanel.tsx`, `TicketsSearchForm.tsx`
- `components/detail/` — `TicketStatusBadge.tsx`, `TicketActorInfo.tsx`, `TicketHistoryList.tsx`
- `components/comments/` — `TicketCommentsPanel.tsx`, `TicketCommentForm.tsx`, `TicketCommentItem.tsx`, `TicketCommentDeleteModal.tsx`, `useTicketCommentActions.ts`
- `components/dialogs/` — `TicketDeleteModal.tsx`
- `components/layout/` — `TicketPageLayout.tsx`, `TicketsBackButton.tsx`
- `components/feedback/` — `TicketRequestError.tsx`
- `routes/helpers.tsx` — `parseTicketId()` validates route param; throws redirect on invalid ID
- `utils/` — `getErrorMessage()` maps error types to user-facing strings

### Shared (`src/shared/`)

- `api/http.ts` — `createApiUrl`, `ensureSuccess`, error classes (`HttpError`, `UnauthorizedError`)
- `config/env.ts` — typed environment config (`VITE_API_BASE_URL`)
- `ui/toast.tsx` — toast notification system (Mantine notifications, top-right position)
- `utils/` — utility functions (date, searchParam, url)

### Path Aliases

`@/*` maps to `./src/*`. All imports use the `@/` prefix.

### Testing

- Vitest + Testing Library + jsdom
- MSW for API mocking (`src/mocks/handlers.ts`, `src/mocks/node.ts`); handlers seed 40+ tickets with mock delay (1500 ms)
- Test fixtures in `src/test/fixtures/` — e.g., `ticketActors.ts` exports `TICKET_CREATOR`, `TICKET_EDITOR`, `TICKET_ADMIN`
- Tests colocated with source files as `*.test.{ts,tsx}`
- `createTestQueryClient()` helper configures a QueryClient suitable for tests (no retries, short gcTime)
- `vitest.setup.ts` sets up MSW server and stubs `window.matchMedia`, `scrollTo`, `ResizeObserver`
- `VITE_API_BASE_URL` is overridden to `http://localhost:8787` in vitest config

### Key Patterns

- **Query key factory**: `ticketsQueryKey.list(filter)`, `ticketsQueryKey.detail(id)` — used for targeted cache invalidation. `updateTicketDetailCache()` writes optimistic/fresh data to the detail entry and then invalidates all list queries.
- **Router context**: `QueryClient` is passed via router context, enabling `beforeLoad` data fetching and prefetching.
- **Form handling**: react-hook-form + `@hookform/resolvers/zod` + Zod schemas. Use `Controller` for Mantine `Select` and other controlled inputs.
- **Search params**: `stripSearchParams` middleware strips params that equal `TICKETS_SEARCH_DEFAULT`; Zod search schema fields use `.catch()` so invalid values silently fall back to defaults.
- **Auth flow**: `_authenticated` layout route's `beforeLoad` checks the session via `authQueryKey.session()`; `AuthRedirectController` (mounted in root) watches the query cache and auto-redirects on `UnauthorizedError`.
- **Detail route remounting**: `$ticketId` routes use `remountDeps: [Route.useParams]` so navigating between tickets fully remounts the component.
- **Error handling**: `getErrorMessage()` maps `HttpError`/`UnauthorizedError`/`Error` to strings; `TicketRequestError` renders the error UI; form mutation errors are shown via toasts.

## Coding Conventions

- Biome is the formatter/linter (not ESLint/Prettier). See `biome.json` for config. `src/routeTree.gen.ts` is excluded.
- Single quotes, semicolons, trailing commas, 2-space indent, max line width 100
- Prefer named React imports (no default `React` import)
- Commit style: `feat:`, `fix:`, `refactor:`, `chore:` with concise scopes
- Environment variable: `VITE_API_BASE_URL` (dev default: `http://localhost:7080`, test override: `http://localhost:8787`)
