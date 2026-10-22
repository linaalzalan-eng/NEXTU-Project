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

## D-28 — Dashboard, Analytics, and charts (Phase 4)
- **Decision:**
  - **Calculations:** every number on the Dashboard and Analytics comes from the pure functions in `src/lib/stats.js`, `features/dashboard/lib/motivation.js`, and `features/analytics/lib/` (D-09), run in `useMemo` over the task list from `TasksProvider`. `today` comes from `useToday()`, so the numbers follow midnight (BR-10) and every task change (BR-11).
  - **BR-13 band edge:** "none done" and "all done" are decided from the raw counts. Between them, the band follows the displayed rate (≥ 50 is "close"), so 99/200, shown as 50%, gets the 50–99 message.
  - **Components:** `TodaySummary` keeps the rate, progress bar, and counts in one hero panel, as in the `DESIGN_SYSTEM.md` Dashboard wireframe. The separate `ProgressCard` named in the plan was not created. `TasksLoadError` is the shared error state of the three data pages. The Dashboard list offers toggling and quick add only (PRD F3); editing and deleting stay on the Tasks page. `TaskItem`'s read-only mode, used only by the Phase 2 preview, was removed with the preview files.
  - **Trend summary:** the 8-week total and the strongest week (ties to the most recent, as BR-05) come from the pure `summarizeHistory()` in `weeklyStats.js`, not from the chart component. A week without tasks is described as "No tasks", never "0 of 0" (BR-06).
  - **Analytics empty state:** shown only when the user has no tasks at all. With tasks but no completions, the cards show their own empty states ("Not enough data", "No record yet").
  - **Recharts 3.10.1** (with its peer `react-is` 19.3.0, matching React), chosen at the newest release at least two weeks old. It is imported only by the lazy Analytics route (NFR-03).
  - **Chart design:** the present is solid pine and the past a dashed outline (DESIGN_SYSTEM §1). Pine against the `line-strong` outline passed the dataviz palette validator's colour-blind (ΔE 14.7) and normal-vision (ΔE 18.6) separation checks and 3:1 contrast. Two measures with different scales (weekly count and rate) are two small charts on one week axis, never one chart with two value axes. No animation.
  - **Chart accessibility (NFR-44):** each chart is a `ChartFigure` with a visible one-sentence summary and a "Show as table" data table. The drawing is `aria-hidden` and Recharts' keyboard layer is off, so nothing hidden can take focus. The hover tooltip is a convenience for mouse users only.
  - **Charts in RTL:** the drawing is laid out LTR (`ChartCanvas`), because SVG text in an RTL page flips `text-anchor` and pushed the axis labels into the plot. In Arabic the chart mirrors itself (reversed x axis, value axis on the right, the past/present pair reversed), and the tooltip keeps the page direction.
  - **Development seed (P4-T01):** `services/mock/devSeed.js`, loaded by `main.jsx` only when `import.meta.env.DEV` is true, adds `nextu.seed()`, `nextu.seed({ count })`, and `nextu.clear()` to the browser console. The data is deterministic (seeded random numbers) and valid (VR-03, VR-04, BR-12, BR-14). The production build was checked: it contains none of it.
  - **Tests:** jsdom has no `ResizeObserver`, so `src/test/setup.js` adds a no-op stub and the charts render at their `initialDimension`. Chart drawing is checked in a real browser.
- **Status:** Approved (2026-10-15). Minor technical decisions within the approved phase.

## D-29 — Task feature refactor after the code smell review (2026-10-17)
- **Context:** `CODE_SMELL_PHASE_3.md` (project root) reviewed the Phase 3 task feature. The owner approved applying its findings. Behaviour visible to the user is unchanged except for the fixes listed below.
- **Decision:**
  - **One action contract:** every action from `useTaskActions()` resolves (never rejects) to the saved task, or to `null` when it failed and the user has been told. The exception is `saveEdit`, used by the edit dialog: it rejects with the `ServiceError` so the dialog can show the message, except for `NOT_FOUND`, which resolves to `null`. The "no longer exists" notice is shown only by `useTaskActions`. Renamed: `toggle` → `setCompleted`, `update` → `saveEdit`.
  - **Rollback on the current version:** a failed toggle undoes only `status` and `completedAt` on the task as it is now, and a failed delete restores the version that was on screen. "Try again" starts from the current version of the task (`getTask(id)` from `TasksProvider`). An older copy can no longer bring back an old title or date.
  - **Shared rules:** `applyCompletion()` (`features/tasks/lib/taskCompletion.js`) is BR-12 for both the optimistic update and the mock service. `byDateThenCreation()` (`taskSelectors.js`) is the one service order, with `id` as the last tie-breaker (API_CONTRACTS §4). `isTaskLocked()` decides once, in `TaskList`, whether a row and its extra control are locked.
  - **Naming:** the list's load state is `loadStatus` (in `useTasks` and `useAnalytics`), so it is not confused with a task's `status`.
  - **Tasks page:** `DayTasksSection` holds the viewed day (navigation, heading, quick add, filter, list, empty state). `TasksPage` wires data, overdue tasks, and the dialogs. An active status filter stays visible on a day without tasks, so a new task it hides is never a mystery.
  - **Forms:** the edit dialog clears a field's error as soon as the field is edited, like the create form.
  - **One request per task, also for "Try again":** a toast sits outside the locked UI, so its retry first checks `isBusy(id)` from `TasksProvider` (a ref updated at once, unlike the `busyIds` state) and does nothing while a request for that task is in flight. That request reports its own result. Found by the `code-reviewer` after the refactor.
  - **Services importing feature rules:** the mock service now also imports `applyCompletion` and `byDateThenCreation` from `features/tasks/lib/`, not only the validators (API_CONTRACTS §4 notes). These are pure rules shared by the service and the UI. They stay in the feature folder while the tasks feature is their only user.
- **Deferred to Phase 5** (recorded in `IMPLEMENTATION_PLAN.md`): scope `TasksProvider` to the signed-in user, and normalize timestamps in the Supabase mapper.
- **Status:** Approved by the owner (2026-10-17).

## D-30 — Supabase connection and authentication details (Phase 5)
- **Decision:**
  - **Library:** `@supabase/supabase-js` 2.117.2, the newest release at least two weeks old. It is the backend client named in ARCHITECTURE §1. Client defaults are kept: the session is stored in localStorage and refreshed automatically, and links from emails are read from the address (implicit flow).
  - **Publishable key:** the frontend uses `VITE_SUPABASE_PUBLISHABLE_KEY`, not `VITE_SUPABASE_ANON_KEY` as first planned. Supabase now issues publishable keys (`sb_publishable_...`) as the replacement for the legacy `anon` key, which it is phasing out. Either value works in the variable. The secret / service-role key is never used (NFR-11).
  - **Selecting the implementation:** `services/index.js` loads the chosen implementation with a dynamic `import()` behind a build-time constant (`VITE_DATA_SOURCE`). The production build of one source contains nothing of the other (verified: the mock build has no Supabase code, the Supabase build no mock).
  - **Table privileges:** the migration grants `select, insert, update, delete` on `tasks` to `authenticated` and revokes everything from `anon`. Supabase no longer exposes new tables to its Data API automatically (new projects since 2026-05-30; existing projects from 2026-10-30), so without the grant every query would fail. RLS still decides which rows. With no grant, `anon` gets a permission error instead of an empty list (ST-05).
  - **Auth state:** `AuthContext.js` + `AuthProvider.jsx` + `useAuth.js`, the same split as tasks (D-27). `status` is `'loading' | 'authenticated' | 'unauthenticated'`. The actions apply their returned session at once, so the route guards see it without waiting for an event. When the browser restores a page from its back/forward cache, the provider reads the saved session again; otherwise Back after logging out on another page could show the old signed-in page (found in the Chrome check, US-03).
  - **Recovery session:** a session from a reset link carries `isRecovery: true` (`Session` in API_CONTRACTS §1). Supabase announces it only once (`PASSWORD_RECOVERY`), possibly after the app has already read the session, which would make `/reset-password` redirect a recovery session to `/dashboard`. The Supabase auth service therefore also reads the link's `access_token` (with `type=recovery`) from the address when it is created, right after the client and before the client clears it. A session counts as recovery only when it carries exactly that token, so typing `#type=recovery` (or a forged token) into a signed-in browser cannot open the password form; found by the `code-reviewer`. The flag ends when the new password is saved, on `USER_UPDATED`, on logout, or on a password login.
  - **Secure password change (optional backstop):** Supabase Auth's "Secure password change" setting makes the server itself require a recent login for a password change. Recommended in the setup steps; the app does not depend on it.
  - **Tests never use Supabase:** Vite loads `.env.local` in every mode, so `vite.config.js` sets `test.env.VITE_DATA_SOURCE = 'mock'`. With `VITE_DATA_SOURCE=supabase` in the environment the suite still runs on the mock (verified).
  - **Rate limits on the forgot form:** Supabase limits repeated emails only for addresses that have an account, so a `RATE_LIMITED` answer would reveal a registered email. The forgot form shows the same "check your inbox" screen for it. Known limitation: on sign-up with confirmation on, a repeated request for an existing unconfirmed address can still show "too many attempts".
  - **Pagination:** a project's API "Max rows" can be set below 1000, so `listTasks` continues after the rows actually received and stops at an empty page. This costs one extra small request per load.
  - **Logout without a network:** supabase-js removes the local session even when the server call fails, so a logout whose session is gone is treated as done; only a logout that left the session in place shows an error.
  - **`42501` → `UNAUTHENTICATED`:** a signed-in user sees "Your session has ended" if the migration's grants were never applied. Acceptable, because ST-01 and ST-05 catch a missing grant during setup.
  - **Route guards and tasks:** `ProtectedRoute` and `PublicOnlyRoute` are layout routes. `/`, the app pages, and unknown paths are protected. After login, `PublicOnlyRoute` redirects to the page originally requested (only same-app paths). `TasksProvider` now lives inside `ProtectedRoute` with `key={user.id}`: tasks load only with a session, each account gets a fresh task state, and logging out drops the list (D-29 M-1).
  - **Forms:** `useAuthForm` holds the shared mechanics of the four account forms (values, inline errors, focus on the first invalid field, a loading state that also blocks a second Enter). The "check your email" screens (`EmailSent`) never reveal whether an address is registered (D-18, D-19).
  - **Password length (VR-02):** at least 8 characters and at most 72 **bytes** in UTF-8, because the server's password hashing stops at 72 bytes. For Latin letters and digits this is the same as 72 characters; an Arabic letter takes 2 bytes.
  - **Error codes:** Supabase Auth error codes (`invalid_credentials`, `email_not_confirmed`, `user_already_exists`, `over_email_send_rate_limit`, `same_password`, ...) and PostgreSQL codes (`23514` check violation, `42501` RLS) map to `ServiceError` codes in `services/supabase/supabaseErrors.js`; a status of 0 is `NETWORK`. On `/reset-password`, `VALIDATION` means Supabase refused the password itself (for example the current one).
  - **Mock auth:** the demo user starts signed in, so `npm run dev` with the mock opens the app directly. Logging out is remembered in localStorage (`nextu.mockSignedOut`) until the next login, so every auth screen and guard can be used and tested without Supabase.
  - **Layout:** `components/layout` (SideNav, AppLayout) uses the auth feature's `LogoutButton`. The Phase 2 preview helper `usePreviewSubmit` and its string were removed.
- **Known limitations:**
  - Reloading `/reset-password` after the link's token has left the address loses the recovery state, and the (normal) session is sent to `/dashboard`. An expired link opened in a browser that already has a normal session also goes to `/dashboard`, not to "Link invalid or expired". The user requests a new link.
  - A Supabase build without `VITE_SUPABASE_URL` or the key stops before React starts (blank page with a console error), so the ErrorBoundary cannot show it. Vercel's environment variables are a Phase 6 checklist item.
  - After a deploy the service chunk is fetched before the first render (a top-level `await`), one extra small request. Not measurable on a local check; revisit in Phase 6 if Lighthouse flags it.
- **Status:** Approved (2026-10-17). Minor technical decisions within the approved phase.

---

## Resolved open decisions

- **OD-01** (email confirmation on sign-up) → resolved by D-18.
- **OD-02** (password reset flow) → resolved by D-19.

No decisions are open.

## D-31 — Owner-approved Phase 5 closure and focused finalization
- **Date/status:** 2026-10-22, explicitly approved by owner.
- **Decision:** Close Phase 5 on verified core authentication, CRUD, RLS and session-persistence results; defer real-inbox confirmation/recovery, dashboard URL confirmation and remaining external manual checks. Deferred does not mean passed. Carry them into the deployment checklist.
- Keep the Free-plan Leaked Password Protection Disabled warning as an accepted limitation; do not upgrade or change security settings. No leaked-password screening is supplied by other validation.
- Authorize Phase 5 commit, then Phase 6 implementation and a separate commit. Preserve current MVP scope/design/languages. Reuse successful unchanged checks; run only new or affected verification.
- Public deployment, destructive database operations and significant security changes retain their approval gates. Phase 6 may be ready for deployment without claiming a deployed Beta.
