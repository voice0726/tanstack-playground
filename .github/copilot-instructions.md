# Pull request review priorities

When reviewing pull requests, prioritize actionable findings about:

- Bugs and behavioral regressions.
- React state and effect correctness, including stale state and synchronization errors.
- TypeScript type safety, especially unsafe assertions and unhandled states.
- Accessibility regressions in interactive UI.
- Missing tests for user-visible behavior changes.
- Mismatches between frontend requests or responses and backend API contracts.

Do not comment on formatting handled by automated tooling.
Avoid minor naming preferences unless they affect behavior or materially hinder understanding.
