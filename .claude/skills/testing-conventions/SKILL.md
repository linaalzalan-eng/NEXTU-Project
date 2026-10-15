---
name: testing-conventions
description: How to write and run tests in the NEXTU frontend — Vitest + React Testing Library setup, file placement, test IDs from TESTING_PLAN, fixed dates, the makeTask factory, the dialog shim, and how to report results. Use when adding or changing tests, or code that needs tests.
---

# Testing conventions — NEXTU

Follow `CLAUDE.md` and `docs/TESTING_PLAN.md` (test IDs UT/CT/IT). This skill is the practical checklist.

## 1. Commands
- `npm run test` — watch mode while working.
- `npm run test:run` — one run. Use it before reporting, and record the summary line in `docs/PROGRESS.md`.
- Never report a test as passing unless it ran in this session.

## 2. Files and setup
- Tests sit next to the file: `dates.js` → `dates.test.js`, `TaskItem.jsx` → `TaskItem.test.jsx`.
- Import test functions explicitly: `import { describe, expect, it, vi } from 'vitest'`. There are no globals.
- `src/test/setup.js` (runs before every test file):
  - Loads the jest-dom matchers (`toBeInTheDocument`, `toHaveAttribute`, …).
  - Runs RTL `cleanup()` and `localStorage.clear()` after each test.
  - Shims `<dialog>` `showModal`/`close` for jsdom, including Escape and focus return. Browser behavior is still checked by hand.
- `src/test/factories.js`: `makeTask(overrides)` builds a valid Task (BR-12-consistent). Pass only what the test cares about.
- Put the test ID in a comment above the `describe`, e.g. `// UT-02 (VR-03, VR-04, BR-14)`.

## 3. Dates and time
- Business rules take `today` as a parameter. Pass a fixed string such as `'2026-10-14'`; never read the clock in a rule test.
- For components or hooks that read the clock, fake only `Date`:
  `vi.useFakeTimers({ toFake: ['Date'] }); vi.setSystemTime(new Date(2026, 9, 14, 9, 0))` and `vi.useRealTimers()` in `afterEach`.
  Faking timers too (for midnight rollover) needs `vi.advanceTimersByTime`.
- Time-zone cases: set `process.env.TZ` in `beforeAll` and restore it in `afterAll`.

## 4. Components (React Testing Library)
- Query like a user: `getByRole(..., { name })`, `getByLabelText`, `getByText`. Avoid class names and test IDs.
- Interact through `setupUser()` from `src/test/setupUser.js` (userEvent with `delay: null`) and `await user.click/type/keyboard(...)`. Do not call `userEvent.setup()` directly.
- Time limits: tests 30 s (`testTimeout`), `findBy…`/`waitFor` 3 s (`asyncUtilTimeout`). Do not raise them per test; make a slow test faster instead.
- Components that use `t()` need `<I18nProvider>`; links need a router (`<MemoryRouter>`); toasts need `<ToastProvider>`. `renderWithProviders(ui, { lang, route })` from `src/test/renderWithProviders.jsx` wraps all three and returns `user` (English by default).
- UI text in assertions: the default language is Arabic. Either assert the Arabic text, or set `localStorage.setItem('mind.lang', 'en')` before rendering and assert English.
- Integration tests render `<App />` after `window.history.pushState({}, '', '/tasks')`, so the real providers and routes are used.
- Service failures: `vi.spyOn(tasksService, 'createTask').mockRejectedValueOnce(new ServiceError('NETWORK'))`. Restore with `vi.restoreAllMocks()`.

## 5. What every change needs
- Every business rule (pure function) gets unit tests, including boundaries and empty input.
- Every component that handles user input gets a component test for the main path, validation, and accessible names.
- Run `npm run lint` and `npm run test:run` before saying a task is done.
