# Codebase Review Report — 2026-03-13

## Summary

| Priority | Count | Key Themes |
|----------|-------|------------|
| HIGH | 6 | API response handling, auth cache leak, sort order typo, form type error |
| MEDIUM | 10 | Code duplication, toast stability, responsibility boundaries, naming |
| LOW | 6 | Import alias inconsistency, minor naming/style |

---

## HIGH Priority

### H-1: `deleteTicket` ignores server response and returns local value
- **File:** `src/features/tickets/api.ts:81`
- **Confidence:** 90
- **Issue:** `return deleteTicketResponseSchema.parse({ id })` — server response body is never read. If server returns 204 No Content, parsing a fabricated `{ id }` is misleading. If server returns actual data, it's ignored.
- **Fix:** If backend returns 204, change return type to `void`. If backend returns body, read and parse it.

### H-2: Logout cache clear is hardcoded to `tickets` only — data leak risk
- **Files:** `src/features/auth/hooks/useLogout.ts:16`, `src/features/auth/components/AuthRedirectController.tsx:22`
- **Confidence:** 82
- **Issue:** `queryClient.removeQueries({ queryKey: ticketsQueryKey.all })` — auth module depends on tickets module directly. Adding new authenticated features requires updating 2 locations. Forgetting causes stale user data to persist after logout.
- **Fix:** Use `queryClient.clear()` or `queryClient.removeQueries()` (no key filter) on logout/unauthorized.

### H-3: `sortOrder` uses `"dsc"` instead of `"desc"` — potential API contract mismatch
- **File:** `src/features/tickets/schema/search.ts:21`
- **Confidence:** 85
- **Issue:** `z.enum(['asc', 'dsc'])` — `"dsc"` is non-standard. If backend expects `"desc"`, queries silently use wrong sort order. Tests also use `"dsc"` so this won't be caught by tests.
- **Fix:** Verify backend API contract. If backend uses `"desc"`, change to `z.enum(['asc', 'desc'])` and update tests/defaults.

### H-4: `TicketCommentsPanel` / `TicketCommentItem` useForm type parameters are wrong
- **Files:** `src/features/tickets/components/comments/TicketCommentsPanel.tsx:38`, `src/features/tickets/components/comments/TicketCommentItem.tsx:48`
- **Confidence:** 85
- **Issue:** `useForm<TicketCommentFormOutput, unknown, TicketCommentFormOutput>` — first type param should be `TicketCommentFormInput` (form input type), not `Output`. This bypasses Zod input→output transformation type safety.
- **Fix:** Change to `useForm<TicketCommentFormInput, unknown, TicketCommentFormOutput>`.

### H-5: `readErrorMessage` double-consumes response body
- **File:** `src/shared/api/http.ts:30-55`
- **Confidence:** 80
- **Issue:** When `response.json()` succeeds but no `message` field exists, code falls through to `response.text()` which fails (body already consumed). The outer `catch` masks this, returning fallback — but JSON body content is lost.
- **Fix:** Store JSON parse result and extract message from it, or clone response before reading.

### H-6: `AuthRedirectController` queryKey comparison is fragile
- **File:** `src/features/auth/components/AuthRedirectController.tsx:40`
- **Confidence:** 85
- **Issue:** `event.query.queryKey[0] === authSessionQueryOptions().queryKey[0]` compares only first element (`'auth'`). Any future auth-namespaced query would be incorrectly skipped.
- **Fix:** Compare full queryKey array or use a dedicated flag.

---

## MEDIUM Priority

### M-1: 5 mutation hooks duplicate identical `onSuccess` cache update logic
- **Files:** `useCreateTicket.ts`, `useUpdateTicket.ts`, `useCreateTicketComment.ts`, `useUpdateTicketComment.ts`, `useDeleteTicketComment.ts`
- **Confidence:** 82
- **Issue:** All share: `setQueryData(detail) + invalidateQueries(lists)`. Comment mutations don't need list invalidation.
- **Fix:** Extract shared `onTicketMutationSuccess` helper, differentiate ticket vs comment cache strategies.

### M-2: `ToastProvider` `showToast`/`closeToast` lack `useCallback` — causes unnecessary re-renders
- **File:** `src/shared/ui/toast.tsx:54-66`
- **Confidence:** 80
- **Issue:** New function references on every render propagate through Context to all `useToast()` consumers. `ToastView`'s `useEffect` depends on `onClose`, so timer resets on re-render.
- **Fix:** Wrap both in `useCallback`.

### M-3: `resetTicketsStore` name is misleading — it also resets auth state
- **File:** `src/mocks/handlers.ts:136`
- **Confidence:** 80
- **Issue:** Function resets `isAuthenticated = false` in addition to tickets store, but name suggests tickets-only reset.
- **Fix:** Rename to `resetMockState` or split into separate functions.

### M-4: `updateTicketComment` uses `CreateTicketCommentRequest` schema
- **File:** `src/features/tickets/api.ts:113`
- **Confidence:** 85
- **Issue:** Update operation reuses create schema. Works now but breaks if update gets additional fields.
- **Fix:** Create `UpdateTicketCommentRequest` schema (can extend create schema for now).

### M-5: `TicketDeleteModal` and `TicketCommentDeleteModal` are nearly identical
- **Files:** `src/features/tickets/components/dialogs/TicketDeleteModal.tsx`, `src/features/tickets/components/comments/TicketCommentDeleteModal.tsx`
- **Confidence:** 80
- **Issue:** Same structure, same prop interface (`opened/onClose/onConfirm/isDeleting`). Only title and body differ.
- **Fix:** Extract generic `DeleteConfirmModal` component.

### M-6: `useTicketCommentActions` receives `resetCreateForm` from component — responsibility leak
- **File:** `src/features/tickets/components/comments/useTicketCommentActions.ts:16-17`
- **Confidence:** 80
- **Issue:** Custom hook directly manipulates component's form state via passed `reset` function.
- **Fix:** Return `onSuccess` callback from hook, let component handle form reset.

### M-7: `TICKETS_STALE_TIME` / `TICKET_STALE_TIME` defined in separate hook files
- **Files:** `src/features/tickets/hooks/useTickets.ts:7-8`, `src/features/tickets/hooks/useTicket.ts:5-6`
- **Confidence:** 80
- **Fix:** Move to shared constants file (e.g. `queryKeys.ts` or `constants.ts`).

### M-8: `_authenticated.tsx` `beforeLoad` uses `staleTime: 0` — fetches on every navigation
- **File:** `src/routes/_authenticated.tsx:6-9`
- **Confidence:** 80
- **Issue:** Every authenticated route navigation triggers `/api/auth/me` request, while `useAuthSession` caches for 60s. May be intentional for security, but creates unnecessary requests for in-app navigation.

### M-9: MSW `deleteTicketCommentItem` returns 200 with body instead of 204
- **File:** `src/mocks/handlers.ts:542`
- **Confidence:** 82
- **Issue:** Ticket delete handler correctly returns 204, but comment delete returns 200 with body. Inconsistent with REST conventions.

### M-10: `handlers.test.ts` describe block `'listTickets'` contains unrelated CRUD tests
- **File:** `src/mocks/handlers.test.ts:61`
- **Confidence:** 75
- **Issue:** Tests for create, update, comment operations are nested under `listTickets` describe.

---

## LOW Priority

### L-1: `@/` import alias used in 6 files instead of project standard `#/`
- **Files:** `src/mocks/handlers.ts`, `src/mocks/handlers.test.ts`, `src/test/fixtures/ticketActors.ts`, `src/routes/__root.tsx`, `src/main.tsx`, `src/router.tsx`
- **Note:** `router.tsx` and `main.tsx` may use `@/` for routeTree.gen.ts compatibility.

### L-2: `routes/index.tsx` contains login form logic instead of delegating to feature module
- **File:** `src/routes/index.tsx`
- **Issue:** Violates "routes are thin wrappers" convention from CLAUDE.md.

### L-3: `parseTicketId` duplicated in `helpers.tsx` and `ticketCrudRoutes.test.tsx`
- **Files:** `src/features/tickets/routes/helpers.tsx:4`, `src/features/tickets/routes/ticketCrudRoutes.test.tsx:40`

### L-4: `date.test.ts` timezone-dependent — may fail in CI (UTC) vs local (JST)
- **File:** `src/shared/utils/date.test.ts:6`
- **Fix:** Use ISO strings with explicit offset, or set `TZ` env in vitest config.

### L-5: `withQuery` doesn't handle `path` with existing query string
- **File:** `src/shared/utils/url.ts:30-34`
- **Issue:** `${path}?${queryString}` would double `?` if path already has query params.

### L-6: `formatDateTime` imports `ja` locale unnecessarily — format is purely numeric
- **File:** `src/shared/utils/date.ts:2-11`

---

## Status

- [ ] H-1: `deleteTicket` response handling
- [ ] H-2: Logout cache clear scope
- [ ] H-3: `sortOrder` "dsc" vs "desc"
- [ ] H-4: useForm type parameters
- [ ] H-5: `readErrorMessage` body double-consume
- [ ] H-6: AuthRedirectController queryKey comparison
- [ ] M-1: Mutation onSuccess duplication
- [ ] M-2: Toast useCallback
- [ ] M-3: resetTicketsStore naming
- [ ] M-4: updateTicketComment schema
- [ ] M-5: Delete modal duplication
- [ ] M-6: useTicketCommentActions responsibility
- [ ] M-7: Stale time constants
- [ ] M-8: beforeLoad staleTime:0
- [ ] M-9: Comment delete HTTP status
- [ ] M-10: Test describe grouping
- [ ] L-1: Import alias inconsistency
- [ ] L-2: routes/index.tsx logic
- [ ] L-3: parseTicketId duplication
- [ ] L-4: Timezone-dependent test
- [ ] L-5: withQuery edge case
- [ ] L-6: Unnecessary locale import
