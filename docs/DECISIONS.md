# Decision Log

Format: lightweight ADR. Status values: **Approved**, **Proposed** (awaiting owner approval), **Superseded**.
Business rules (BR-xx) are defined in `PRD.md`; decisions below reference them instead of repeating them.

---

## D-01 — Standalone Git repository for the project
- **Decision:** Initialize a Git repository inside the project folder.
- **Reason:** The folder was inside a Git repository rooted at the user's home directory, which risked committing unrelated or sensitive files.
- **Alternatives:** Keep using the home-directory repository.
- **Consequences:** Project history is isolated. The home-directory repository is left untouched.
- **Status:** Approved (2026-10-11).

## D-02 — Bilingual UI: Arabic primary (RTL), English (LTR) switch
- **Decision:** Arabic is the default UI language. Users can switch to English. Translations live in a small in-house dictionary (`src/lib/i18n/`) with no i18n library. Layout uses logical CSS properties (Tailwind `ms-*`, `me-*`, `ps-*`, `pe-*`, `start-*`, `end-*`). User-entered text uses `dir="auto"`. Numbers are displayed with Latin digits (0–9) in both languages.
- **Reason:** The target audience is mainly Arabic-speaking. A dictionary is enough for an MVP-sized UI and is easy to understand.
- **Alternatives:** Arabic only; `react-i18next`.
- **Consequences:** Every UI string must go through the translation helper from day one. Pluralization rules are kept simple.
- **Status:** Approved (2026-10-11).

## D-03 — Documentation in English, explanations in Arabic
- **Decision:** Files in `docs/` are written in English. Explanations and phase reports to the owner are in Arabic.
- **Reason:** Technical terms are more precise in English and render correctly in the terminal.
- **Alternatives:** Arabic documentation.
- **Status:** Approved (2026-10-11).

## D-04 — Single `tasks` table
- **Decision:** The database has one application table, `tasks`, linked to Supabase's `auth.users`. There is no `profiles` table in the MVP.
- **Reason:** The MVP needs no user data beyond authentication. Statistics are derived from tasks.
- **Alternatives:** Add a `profiles` table for display name and preferences; add a `daily_stats` snapshot table.
- **Consequences:** Language preference is stored in the browser (localStorage) and is not synced across devices.
- **Status:** Approved (2026-10-11).

## D-05 — Minimal task fields
- **Decision:** A task has `id`, `user_id`, `title`, `status`, `task_date`, `created_at`, `updated_at`, `completed_at`. It has no description, priority, category, or difficulty.
- **Reason:** These fields are enough for the MVP features and keep forms fast.
- **Alternatives:** Add an optional description or priority.
- **Status:** Approved (2026-10-11).

## D-06 — `status` as constrained text instead of a boolean
- **Decision:** `status` is a `text` column restricted to `'pending'` or `'completed'` by a CHECK constraint. A second constraint ties `completed_at` to `status` (see `DATABASE_SCHEMA.md`).
- **Reason:** The values are explicit and readable, and the column can later be extended (e.g., `'skipped'`) without a type change.
- **Alternatives:** A boolean `is_completed` column; a PostgreSQL enum type.
- **Status:** Approved (2026-10-11). Minor technical decision.

## D-07 — State management: React Context + custom hooks
- **Decision:** Shared state uses React Context and custom hooks (`useAuth`, `useTasks`). There is no Redux, Zustand, or React Query.
- **Reason:** The app is small. These are built into React and teach core concepts.
- **Alternatives:** React Query for server state; Zustand.
- **Consequences:** Loading, error, and refresh logic is written by hand in hooks. React Query can be adopted later if caching needs grow.
- **Status:** Approved (2026-10-11).

## D-08 — Service layer with swappable mock and Supabase implementations
- **Decision:** All data access goes through `src/services/`. In Phases 3–4 a mock implementation persists data in `localStorage`. In Phase 5 a Supabase implementation with the same contract replaces it. The active implementation is selected by `VITE_DATA_SOURCE` (`mock` | `supabase`).
- **Reason:** Features can be built before a backend exists, and the UI never imports Supabase directly. Tests can use the mock.
- **Alternatives:** Build directly against Supabase from the start.
- **Consequences:** Both implementations must follow `API_CONTRACTS.md` exactly.
- **Status:** Approved (2026-10-11).

## D-09 — Analytics computed on the client with pure functions
- **Decision:** Statistics are computed in the browser by pure JavaScript functions in `features/*/lib/`, from the user's tasks.
- **Reason:** The functions are easy to test, transparent, and need no database logic in the MVP.
- **Alternatives:** SQL views or Postgres RPC functions.
- **Consequences:** Personal best needs the full task history. By default, Supabase's API returns at most 1000 rows per request, so the Supabase service must paginate. If a user exceeds roughly 10k tasks, move the aggregation into SQL.
- **Status:** Approved (2026-10-11).

## D-10 — No date library; calendar dates as `YYYY-MM-DD` strings
- **Decision:** Task dates are handled as local calendar-date strings (`"2026-10-11"`) through small helpers in `src/lib/dates.js`, covered by unit tests.
- **Rule:** Only `todayLocal()` reads the local clock. Every other operation (`addDays`, `startOfWeek`, weekday lookup) parses `YYYY-MM-DD` into a UTC date (`Date.UTC`, `getUTCDay`) and formats it back. This avoids bugs in regions where clocks jump at midnight for daylight-saving time, so a local midnight can be skipped.
- **Reason:** Calendar dates have no time zone, so string dates avoid UTC-shift bugs. The amount of date math needed is small.
- **Alternatives:** `date-fns`, `dayjs`.
- **Status:** Approved (2026-10-11).

## D-11 — `DESIGN_SYSTEM.md` written in Phase 2
- **Decision:** The design system document and screen specifications are created in task P2-T01, not in Phase 1.
- **Reason:** They are written together with the UI foundation, so they will not need rewriting.
- **Status:** Approved (2026-10-11).

## D-12 — Hard delete of tasks
- **Decision:** Deleting a task removes it permanently. Its effect on statistics is defined in BR-07.
- **Reason:** It is simple and transparent: statistics always reflect the tasks that exist.
- **Alternatives:** Soft delete with a `deleted_at` column.
- **Status:** Approved (2026-10-11).

## D-13 — Week starts on Saturday
- **Decision:** Weeks run from Saturday to Friday (see BR-03).
- **Reason:** This is the common convention in the target region.
- **Alternatives:** Sunday; Monday (ISO 8601).
- **Consequences:** The week start is a single constant (`WEEK_STARTS_ON = 6`) so it can become a user setting later.
- **Status:** Approved (2026-10-11).

## D-14 — Phase-level approval workflow
- **Decision:** The owner approves whole phases. Within an approved phase, Claude executes all tasks in order, makes minor technical decisions independently (recording important ones here), and ends with an Arabic phase report.
- **Reason:** Approving every task separately was too slow. Phase checkpoints keep the owner in control.
- **Consequences:** Commits, pushes, deployments, deleting existing work, and paid-service changes always need explicit approval. This is enforced partly by `.claude/settings.json`.
- **Status:** Approved (2026-10-11). Supersedes the task-level approval described in the original brief.

## D-15 — Claude Code configuration: one read-only reviewer agent, skills added when needed
- **Decision:** Phase 1 creates `CLAUDE.md`, `.claude/settings.json`, and one subagent, `code-reviewer`, limited to read-only tools. Skills are deferred: `feature-development` in Phase 2 and `testing-conventions` in Phase 3.
- **Reason:** Implementation must happen in the main conversation, where the owner sees the explanations. Conventions for code that does not exist yet would be speculative. A skill named `code-review` would collide with the built-in `/code-review` command.
- **Status:** Approved (2026-10-11).

## D-16 — React Router in declarative mode
- **Decision:** Use React Router's declarative API (`<BrowserRouter>`, `<Routes>`, `<Route>`). Data loading stays in our hooks, not in router loaders.
- **Reason:** It is the simplest mode for a first-time React Router learner and fits D-07.
- **Alternatives:** Data mode (`createBrowserRouter` with loaders); framework mode.
- **Status:** Approved (2026-10-11). Minor technical decision.

## D-17 — Database migrations as SQL files in the repository
- **Decision:** Schema and RLS are written as numbered SQL files in `supabase/migrations/`. In Phase 5 they are applied through the Supabase SQL Editor. Adopting the Supabase CLI is optional and can be considered later.
- **Reason:** The schema is version-controlled and reviewable, without adding CLI tooling while learning PostgreSQL.
- **Status:** Approved (2026-10-11). Minor technical decision.

## D-18 — Email confirmation on sign-up (resolves OD-01)
- **Decision:** "Confirm email" is enabled in Supabase Auth for the Beta and production project. The owner may turn it off temporarily in the Supabase dashboard while developing, but it must be on before release (`TESTING_PLAN.md` §8).
- **Reason:** It prevents accounts created with emails the user does not own and keeps registration non-revealing.
- **Alternatives:** Confirmation off in every environment.
- **Consequences:**
  - The app supports both settings. With confirmation on, `signUp` returns no session and the app shows a "check your email" screen. Supabase then does not reveal whether the email was already registered, so the same screen is shown in both cases. `EMAIL_TAKEN` is produced only when confirmation is off.
  - Logging in before confirming fails with `EMAIL_NOT_CONFIRMED`, and the app explains that the email must be confirmed first.
  - The Site URL and redirect URLs must be configured in Supabase Auth so the confirmation link opens the app.
  - On the free plan, Supabase's built-in email sender has a low hourly limit. It is enough for the Beta. Hitting the limit produces `RATE_LIMITED`. A custom SMTP provider is a paid or external-service change and needs owner approval.
- **Status:** Approved (2026-10-11).

## D-19 — Password reset included in the MVP (resolves OD-02)
- **Decision:** The MVP includes a basic "forgot password" flow (US-26) using Supabase's built-in recovery email. It adds two routes:
  - `/forgot-password` (public-only): the user enters an email and always sees the same "If an account exists, we sent a link" message.
  - `/reset-password`: the recovery link opens it with a temporary session. The user sets a new password (VR-02, VR-05) and is then logged in and sent to `/dashboard`. Without a valid recovery session, the page shows "link invalid or expired" with a link to request a new one.
- **Reason:** Without it, a user who forgets the password is locked out permanently. It is small and needs no extra tables or libraries.
- **Alternatives:** Leave it out of the MVP and reset passwords manually from the Supabase dashboard.
- **Consequences:**
  - `authService` gains `requestPasswordReset` and `updatePassword` (`API_CONTRACTS.md`).
  - `/reset-password` is not wrapped in `PublicOnlyRoute`, because the recovery link signs the user in before the page loads.
  - The form appears only for a recovery session (`isRecovery`, from Supabase's `PASSWORD_RECOVERY` event). A user with a normal session is redirected to `/dashboard`, so nobody can change a password from an unattended logged-in browser without the email link. A "change password" screen for logged-in users is not part of the MVP.
  - The reset email uses the same email sender and hourly limit as D-18.
- **Status:** Approved (2026-10-11).

## D-20 — Claude Code protection for environment files
- **Decision:** `.claude/settings.json` denies reading and editing real environment files (`.env`, `.env.local`, `.env.*.local`, `.env.development`, `.env.production`, `.env.test`) at any folder level. It also denies shell commands that mention them. `.env.example` is not denied, so Claude can read it with the Read tool.
- **Reason:** The previous rules used `!.env.example`, but permission rules do not support negation. The broad `.env.*` rule therefore also blocked `.env.example`. Listing the secret files explicitly fixes both problems.
- **Consequences:**
  - The owner creates `.env.local` by copying `.env.example` and fills in the values. Claude never opens it.
  - A new environment file name (for example `.env.staging`) must be added to the deny list.
  - Shell-command rules are pattern-based, so they reduce risk but cannot block every possible command. `.gitignore` and the security rules in `CLAUDE.md` remain the main protection.
- **Status:** Approved (2026-10-11).

## D-21 — Typeface and visual direction
- **Decision:** Use IBM Plex Sans Arabic (weights 400–700) for both languages, loaded from Google Fonts with a `<link>` in `index.html`. The visual direction is "paper and ink" with one primary color (pine) and one accent (ember), as defined in `DESIGN_SYSTEM.md`.
- **Reason:** Plex Sans Arabic has matching Arabic and Latin glyphs, so mixed-language task titles look consistent. Its restrained, editorial character fits the calm, self-comparison tone better than Cairo's rounder, louder shapes. A `<link>` needs no npm package.
- **Alternatives:** Cairo; self-hosting through `@fontsource` (one more dependency).
- **Consequences:** Visitors' browsers request the font from Google's servers. Self-hosting can replace this later without changing any components.
- **Status:** Approved (2026-10-11). Minor technical decision (font choice delegated to Phase 2).

## D-22 — Phase 2 design preview with labelled sample data
- **Decision:**
  - Until real data exists, the Dashboard, Tasks, and Analytics pages show hand-written sample values from `src/pages/preview/`.
  - A visible "Preview" notice explains this and switches to the empty state (`?preview=empty`).
  - The auth forms show a toast instead of submitting.
  - A development-only `/ui` route shows every UI component and state. It is excluded from production builds.
- **Reason:** The owner asked to review a polished interface in Phase 2 without implementing Phase 3–5 logic. Labelled samples avoid presenting fake data as real.
- **Consequences:**
  - Sample values are typed by hand, not calculated. Business rules are implemented and tested in Phases 3 and 4.
  - Each phase removes the preview code it replaces (see the `feature-development` skill).
- **Status:** Approved (2026-10-11).

## D-23 — Tooling versions at scaffold time
- **Decision:**
  - The scaffold uses current major versions: Vite 8, React 19, React Router 8 (declarative mode, imports from `react-router`), Tailwind CSS 4, and ESLint 10 (flat config with `eslint-plugin-react-hooks` and `eslint-plugin-react-refresh`).
  - The Vite template now ships oxlint as its linter. We replaced it with ESLint, as the approved stack specifies.
  - `@types/react` and `@types/react-dom` are kept from the template only for editor IntelliSense. The project stays JavaScript-only.
- **Reason:** Follow the current official setup while keeping the approved stack unchanged.
- **Status:** Approved (2026-10-11). Minor technical decision.

## D-24 — Product name: NEXTU
- **Context:** The project was called "Mind AI Project", but Mind AI is the name of the owner's training program, not the product.
- **Decision:** The product is named **NEXTU** (*Next* + *You*: the next, better version of you). The slogan is "Meet your next self." / "تعرّف على نسختك القادمة." The core philosophy, "Your only competition is your previous self.", is unchanged. The brand name stays in Latin letters in both languages. The npm package is `nextu`. The local folder and the Git history keep their old name.
- **Status:** Approved by the owner (2026-10-11).

## D-25 — Arabic phase explanation file required for every phase
- **Decision:** Every phase ends with a detailed Arabic teaching document, `docs/phase-reports/PHASE_<N>_EXPLAINED.md`, written after implementation and tests. A phase is not complete without it. Its ten sections and writing rules are defined in `CLAUDE.md` ("Phase explanation file"). The short Arabic report in the terminal now summarizes and links to this file.
- **Reason:** The terminal report disappears with the conversation. A file in the repository keeps the learning material next to the code it explains, so the owner can return to it later.
- **Consequences:**
  - `docs/phase-reports/` is written in Arabic. It is the only exception to D-03.
  - Phases 1 and 2 received their files retroactively (2026-10-14), based on the existing documents and code.
- **Status:** Approved by the owner (2026-10-14).

## D-26 — Testing setup (Phase 3)
- **Decision:**
  - Vitest 5 with jsdom, React Testing Library 16, `@testing-library/user-event` 14, and `@testing-library/jest-dom` 7, configured in the `test` block of `vite.config.js`.
  - `@testing-library/dom` is installed explicitly, because React Testing Library declares it as a peer dependency.
  - Test functions are imported explicitly (no Vitest globals). `src/test/setup.js` therefore runs RTL `cleanup()` itself, and also clears localStorage after each test.
  - jsdom has no `<dialog>.showModal()`, so the setup file adds a small shim that follows browser behavior (Escape closes, focus returns). Real dialog behavior is still checked in a browser.
  - ESLint allows Node globals in test files only.
  - Every test types through `setupUser()` (userEvent with `delay: null`). Limits: `testTimeout` 30 s, `asyncUtilTimeout` 3 s. These replaced the defaults after a flaky test was reproduced under parallel load (`PROGRESS.md`, 2026-10-14). Async results are always awaited with `waitFor`/`findBy`.
- **Reason:** These follow the tools' current documentation and the approved stack. Explicit imports make each test file self-explanatory for learning.
- **Consequences:** `TESTING_PLAN.md` asks for 90% line coverage of `lib/` folders. Measuring it needs `@vitest/coverage-v8`, which is not in the Phase 3 dependency list, so coverage is not measured yet. It can be added with the owner's approval.
- **Status:** Approved (2026-10-14). Minor technical decision.

## D-27 — Task state and Tasks page details (Phase 3)
- **Decision:**
  - **Scope:** Phase 3 makes the Tasks page real. The Dashboard keeps its labelled preview until P4-T05, as the plan places its statistics and quick add in Phase 4. Its notice says so.
  - **State files:** `TasksContext.js` (context object), `TasksProvider.jsx` (state and actions), and `useTasks.js`. This is the same split as i18n and Toast, for React Fast Refresh.
  - **Optimistic updates:** create, toggle, and delete change the list at once, then call the service. A failure restores only the affected task (not a whole-list snapshot), so changes to other tasks made meanwhile are kept. While a request for a task is in flight, its id is in `busyIds` and the UI locks that task's controls, so a task never has two requests at once and its restored copy cannot overwrite a newer change. The edit dialog waits for the service and shows a loading state (NFR-02). `NOT_FOUND` removes the task locally (SRS §4).
  - **Feedback:** `useTaskActions` adds toasts. A failure shows a danger toast with "Try again", so the Toast gained an optional `action`. A new task has a `temp-` id until it is saved, and its controls are disabled until then.
  - **Viewed day:** `null` means "today", so the page follows the date when a new day starts (BR-10).
  - **Dialog form mode:** `Dialog` takes an optional `onSubmit`, which wraps the body and footer in one `<form>`. Enter in any field then submits with the footer's Save button.
  - **Title length** counts characters as PostgreSQL `char_length` does (an emoji is one), so the client and the database constraint agree (VR-03).
  - **Calendar days** are formatted with `formatDay` in UTC. Formatting a UTC-midnight date in local time would show the previous day in zones behind UTC.
  - **Mock storage key:** `nextu.tasks`.
- **Known limitation:** native `<input type="date">` fields are drawn by the browser in the browser's own locale. In a browser set to Arabic they show Arabic-Indic digits, unlike the Latin digits of D-02, whatever the page language. Text the app formats keeps Latin digits. A custom date picker would remove this but is not planned.
- **Status:** Approved (2026-10-14). Minor technical decisions within the approved phase.

---

## Resolved open decisions

- **OD-01** (email confirmation on sign-up) → resolved by D-18.
- **OD-02** (password reset flow) → resolved by D-19.

No decisions are open.
