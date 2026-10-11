# Testing Plan

Tools: **Vitest** (test runner) with jsdom, **React Testing Library** with `@testing-library/user-event` and `@testing-library/jest-dom` (set up in P3-T01).
Tests sit next to the file they test as `*.test.js(x)`. Shared helpers live in `src/test/`.
**Rule:** a test is reported as passing only after it has actually been run.

Commands (available from Phase 3):
- `npm run test`: watch mode.
- `npm run test:run`: single run, used in reports and before commits.
- `npm run lint`: ESLint.

## 1. Unit Tests (pure functions, highest priority)

Target: at least 90% line coverage for `src/lib/` and `src/features/*/lib/`.

- **UT-01 `lib/dates.js`:**
  - `todayLocal` uses the local date, not the UTC date.
  - `addDays` works across month and year boundaries and leap days.
  - `startOfWeek` returns Saturday for every weekday (D-13).
  - Comparing dates as strings works correctly.
  - The helpers return correct results when `TZ` is set to a zone whose daylight-saving switch happens at midnight, such as `Asia/Beirut` (D-10 UTC-arithmetic rule).
- **UT-02 `taskValidation`:** VR-03 (empty, whitespace only, 200 vs. 201 characters, trimming) and VR-04/BR-14 (invalid format, out of range, past dates allowed).
- **UT-03 `taskSelectors`:** filtering by date and status, overdue detection (BR-09: pending and past only, not today), sort order (PRD F2).
- **UT-04 `lib/stats.js` and `motivation.js`:**
  - BR-01: 0/0 gives `null`, 0/3 gives 0, 1/3 gives 33, 2/3 gives 67, 3/3 gives 100.
  - Clamping: 199/200 gives 99, not 100, and 1/201 gives 1, not 0.
  - A completion on a later day still counts for the task's date.
  - BR-13 bands at their boundaries, decided from counts: no tasks, 0 completed, 1%, 49%, 50%, 99%, all completed.
- **UT-05 `weeklyStats`:**
  - BR-02: aggregated rate, not the average of daily rates. Example: day A has 1/1, day B has 0/9, so the rate is 10 and not 50.
  - BR-03: Saturday–Friday boundaries.
  - BR-04: to-date windows when today is Saturday (1 day each) and when today is Friday (full week); null previous gives `rateDelta = null`.
  - The 8-week history includes empty weeks.
- **UT-06 `personalBest`:** BR-05 for:
  - An empty history.
  - A tie, where the most recent wins.
  - `isTodayBest` and `isThisWeekBest`.
  - The best in a past week.
  - Future-dated completed tasks being ignored.
  - A deleted task lowering the best (BR-07, through the input).
- **UT-07 `authValidation`:** VR-01, VR-02 (register and new password), and VR-05 (confirmation must match).
- **UT-08 `mockTasksService`:**
  - Implements every contract in `API_CONTRACTS.md`.
  - Data persists through a localStorage round-trip.
  - BR-12 `completedAt` handling.
  - `NOT_FOUND` for unknown ids.
  - `VALIDATION` errors.

## 2. Component Tests (React Testing Library)

Query the way a user would (by role, label, or text). Avoid testing implementation details.

- **CT-01 `TaskForm`:** submit with Enter, inline error for an empty title, the field clears and keeps focus after success.
- **CT-02 `TaskItem`:** toggling calls the action, the completed style includes a non-color cue, Edit and Delete buttons have accessible names.
- **CT-03 `TaskEditDialog`:** prefilled values, Escape cancels, focus returns to the trigger, validation.
- **CT-04 `DeleteTaskDialog`:** shows the warning text from BR-07; confirm and cancel behave correctly.
- **CT-05 `StatusFilter`, `DateNavigator`, and `OverdueSection`:**
  - The active state is exposed (`aria-pressed` or `aria-selected`).
  - RTL mirroring classes and the Today button.
  - The "Today" empty state and the filter-specific empty messages (US-13, US-15).
  - Overdue listing and "Move to today" (US-16, BR-09).
- **CT-06 `ProgressBar`:** `role="progressbar"` with the correct `aria-valuenow`, and the null state.
- **CT-07 Dashboard summary:** shows "—" when there are no tasks, and the counts match the input.
- **CT-08 Analytics cards:** the "Not enough data" state, positive and negative deltas with text or icon cues.
- **CT-09 `LanguageSwitch`:** toggles `lang`/`dir` on `<html>` and persists the choice.
- **CT-10 Login and Register forms:** validation messages, loading state, error messages by code (including `EMAIL_NOT_CONFIRMED`), and the "check your email" screen when `signUp` returns no session (D-18).
- **CT-11 Forgot and Reset password forms (US-26):**
  - Forgot: VR-01 errors; the same success message is shown after any valid submission; network error with Retry.
  - Reset: VR-02 and VR-05 errors; loading state; the form is shown only when `isRecovery` is true; the "Link invalid or expired" state when there is no session; `UNAUTHENTICATED` from `updatePassword` shows the same state.
  - `RATE_LIMITED` shows the "try again later" message.

## 3. Integration Tests (feature level, with the mock service)

- **IT-01 Task lifecycle:** render the Tasks page, create a task, toggle it, edit its title, reschedule it to tomorrow (it disappears from today), navigate to tomorrow (it appears), delete it.
- **IT-02 Dashboard reacts:** toggling a task on the Dashboard updates the counts, rate, progress bar, and message.
- **IT-03 Analytics from seeded data:** a known dataset produces the expected comparison and personal-best values, computed by hand in the test. Editing or deleting a past task then changes past statistics immediately (BR-11).
- **IT-04 Service failure:** the mock is made to throw `NETWORK`, so the optimistic change rolls back and the error message is shown (NFR-21).
- **IT-05 Routing:** an unknown route shows Not Found and `/` redirects to `/dashboard`. From Phase 5, protected routes redirect to `/login` when there is no session, a logged-in user visiting `/forgot-password` is redirected to `/dashboard`, and `/reset-password` shows the form for a recovery session but redirects a normal session to `/dashboard`.
- **IT-06 Day rollover:** with fake timers, advancing past local midnight (or firing a `visibilitychange` event) updates "today", the Dashboard statistics, and the overdue list (BR-10).

## 4. Security Tests (Phase 5, against a real Supabase project)

Use two test accounts, A and B. Each test is run with `supabase-js` from a small script or from the browser console while logged in as A.

- **ST-01** A runs `select` on the tasks table and gets only A's rows.
- **ST-02** A tries to `update` B's task by id: 0 rows are affected.
- **ST-03** A tries to `delete` B's task by id: 0 rows are affected, and B's task still exists.
- **ST-04** A tries to `insert` with `user_id = B`: rejected by RLS.
- **ST-05** Without logging in (anon), a select returns no rows.
- **ST-06** A tries to change a task's `user_id` to B through `update`: rejected by `WITH CHECK`.
- **ST-07** Constraint checks: inserting an empty title, an invalid status, or `completed` without `completed_at` fails.
- **ST-08** Secret scan:
  - `git grep -i "service_role" -- src supabase` returns nothing (the docs mention the term on purpose).
  - Searching the built `dist/` for the service key returns nothing.
  - `.env.local` is not tracked by Git.
- **ST-09** RLS is enabled: the Supabase dashboard Security Advisor shows no RLS warnings.
- **ST-10** Auth email flows (D-18, D-19), checked manually with a real inbox:
  - Registering with an existing email shows the same screen as a new email.
  - Logging in before confirming fails with the "confirm your email" message. The confirmation link opens the app.
  - A reset request for an unregistered email shows the same message as for a registered one.
  - The reset link sets a new password once. The old password then fails. Reusing the link fails.

## 5. Responsive and RTL Testing

Check every page in the browser's device toolbar at **360**, **390**, **768**, **1024**, and **1440** px, in **Arabic (RTL)** and **English (LTR)**:
- [ ] No horizontal scrolling. Navigation switches between the bottom bar and the sidebar at the defined breakpoint.
- [ ] Touch targets are at least 44px on mobile.
- [ ] Chevrons and arrows point the right way in RTL. Spacing mirrors correctly (logical utilities only).
- [ ] Mixed text is correct: an English title in the Arabic UI and an Arabic title in the English UI both render properly.
- [ ] Charts are readable on small screens, and axis or legend order makes sense in RTL.

## 6. Accessibility Testing

- [ ] Keyboard only: register, log in, add a task, complete it, edit it, delete it, switch language, view analytics, log out.
- [ ] Focus is visible everywhere. Dialogs trap focus and return it to the trigger when closed.
- [ ] Lighthouse Accessibility score is at least 90 on every page.
- [ ] A screen-reader spot check (NVDA on Windows) of the task list, progress indicator, and chart summaries.
- [ ] Reduced motion is respected.

## 7. Manual Test Script (run at the end of each phase where relevant)

1. Load the app with empty data and verify the empty states on every page.
2. Add 3 tasks for today, complete 2, and check that the Dashboard shows 2/3 = 67% with the correct message.
3. Add a task for yesterday and leave it pending. It appears as overdue. "Move to today" moves it.
4. Reload the page and check that the data persists.
5. Switch the language, reload, and check that the language and direction persist.
6. (P4) Use seeded data and check the analytics against hand calculations.
7. (P5) Log out and log in on another browser. The same data appears.
8. (P5) Use "Forgot password?", open the emailed link, set a new password, and log in with it (US-26).

## 8. Release Acceptance Checklist (Beta)

- [ ] All criteria in `MVP_SCOPE.md` → Release Acceptance Criteria are met.
- [ ] `npm run lint` and `npm run test:run` pass, with the output recorded in `PROGRESS.md`.
- [ ] `npm run build` succeeds, and the production preview works.
- [ ] ST-01 to ST-10 pass on the production Supabase project.
- [ ] Sections 5 and 6 are checked on the deployed URL.
- [ ] Supabase Auth URL configuration (Site URL and redirect URLs, including `/reset-password`) points to the production domain.
- [ ] Vercel environment variables are set, with no secrets in the client.
- [ ] Deep links (`/tasks` opened directly) work on Vercel.
- [ ] "Confirm email" is enabled in Supabase Auth (D-18), and the password reset flow works end to end (D-19, US-26).
- [ ] README has setup and deployment instructions.
