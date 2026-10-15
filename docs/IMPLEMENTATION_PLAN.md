# Implementation Plan — 6 Phases

References: scope in `MVP_SCOPE.md`, rules in `PRD.md` (BR-xx), requirements in `SRS.md` (FR, NFR, VR), stories in `USER_STORIES.md` (US-xx), tests in `TESTING_PLAN.md`.
Effort is estimated in focused working sessions (about 2 hours each) and includes learning time.

## Workflow: Phase-Level Approval (D-14)

1. The owner approves a phase. Claude then executes all its tasks in order without stopping after each one.
2. Within the approved phase, Claude creates and edits files, installs the dependencies listed for the phase, and runs tests and lint.
3. Minor technical decisions are made independently. Important ones are recorded in `DECISIONS.md`.
4. Claude stops and asks only for decisions that significantly affect product requirements, architecture, security, cost, or existing work.
5. There are no features outside the MVP and no stack changes.
6. At the end of a phase:
   - Run the `code-reviewer` subagent.
   - Fix any critical findings.
   - Write the Arabic explanation file `docs/phase-reports/PHASE_<N>_EXPLAINED.md` (D-25), after implementation and tests.
   - Update `PROGRESS.md` and the related docs.
   - Write the short Arabic phase report, with the path to the explanation file.
   - **Stop.**
7. Never without explicit approval: commit, push, deploy publicly, delete existing work, or make paid-service changes. Claude proposes one commit per phase after the report.

Arabic phase report template: completed work · important files · reasons for key decisions · how to test · unresolved issues · path to the explanation file.
Explanation file: ten sections and writing rules in `CLAUDE.md` ("Phase explanation file"). **Every phase's Definition of Done requires it.**

---

## PHASE 1 — Product Planning & Documentation

- **Objective:** a complete and consistent planning foundation, with no application code.
- **Dependencies:** none.
- **Estimated effort:** 2–3 sessions.

### Tasks
- [x] **P1-T01** Create a standalone Git repository and `.gitignore` (D-01).
- [x] **P1-T02** Write `docs/PROJECT_INTENT.md` and `docs/DECISIONS.md`.
- [x] **P1-T03** Write `docs/MVP_SCOPE.md`.
- [x] **P1-T04** Write `docs/PRD.md`, including business rules BR-01 to BR-14.
- [x] **P1-T05** Write `docs/SRS.md`.
- [x] **P1-T06** Write `docs/USER_STORIES.md`.
- [x] **P1-T07** Write `docs/USER_FLOW.md`.
- [x] **P1-T08** Write `docs/ARCHITECTURE.md`.
- [x] **P1-T09** Write `docs/DATABASE_SCHEMA.md`.
- [x] **P1-T10** Write `docs/API_CONTRACTS.md`.
- [x] **P1-T11** Write `docs/TESTING_PLAN.md`.
- [x] **P1-T12** Write `docs/IMPLEMENTATION_PLAN.md`.
- [x] **P1-T13** Write `docs/PROGRESS.md` and `README.md`.
- [x] **P1-T14** Configure Claude Code: `CLAUDE.md`, `.claude/settings.json`, `.claude/agents/code-reviewer.md`.
- [x] **P1-T15** Resolve OD-01 and OD-02 (D-18, D-19), add US-26 and its requirements and tests, and harden environment-file protection (D-20).
- [x] **P1-T16** Write `docs/phase-reports/PHASE_1_EXPLAINED.md` (added by D-25, written retroactively on 2026-10-14).

### Acceptance criteria
- Every required document exists.
- Each ID (BR, FR, NFR, VR, US, D, OD) is defined in exactly one document.
- Every Must story maps to a phase.

### Tests
None (no code). Instead, the `code-reviewer` subagent checks the documents for consistency.

### Deliverables
- The `docs/` set.
- `README.md` and `CLAUDE.md`.
- Claude Code configuration.

### Definition of Done
- The acceptance criteria are met.
- The Arabic report has been delivered.
- The owner has approved the phase.
- `docs/phase-reports/PHASE_1_EXPLAINED.md` is written (D-25; retroactively, 2026-10-14).

### Risks
- Over-documentation slowing progress. Mitigation: keep documents concise and reference rather than repeat.

### Approval checkpoint
The owner reviews the documents and approves Phase 2. OD-01 and OD-02 are resolved (D-18, D-19).

---

## PHASE 2 — UI/UX & React Foundation

- **Objective:** a running, responsive, bilingual frontend skeleton with navigation and reusable UI components.
- **Dependencies:** Phase 1 approved.
- **New concepts:** Vite project structure, Tailwind v4 `@theme`, React Router, Lucide icons, RTL with logical utilities.
- **Estimated effort:** 4–5 sessions.

### Tasks
- [x] **P2-T01 Design system and screen specs**
  - Create `docs/DESIGN_SYSTEM.md`: visual direction, color tokens (light mode only in the MVP), typography (an Arabic-capable font such as IBM Plex Sans Arabic or Cairo, to be confirmed), spacing, radii, breakpoints, component specs, RTL rules, and accessibility.
  - Add a "Screens" section with text wireframes for Dashboard, Tasks, Analytics, Login, Register, Check your email, Forgot password, Reset password, and Not Found, at mobile and desktop sizes.
- [x] **P2-T02 Initialize Vite + React (JavaScript)**
  - Create the scaffold with `npm create vite@latest` using the `react` (JS) template in a temporary folder, then move it into the project root without touching `docs/` or `CLAUDE.md`.
  - Remove the boilerplate.
  - Verify that `npm run dev` and `npm run build` work.
  - Files: `package.json`, `vite.config.js`, `index.html`, `src/main.jsx`, `eslint.config.js`.
- [x] **P2-T03 Configure Tailwind CSS v4**
  - Install `tailwindcss` and `@tailwindcss/vite`. Add the plugin to `vite.config.js`.
  - Add `@import "tailwindcss";` and the `@theme` tokens from DESIGN_SYSTEM to `src/index.css`.
  - Load fonts.
- [x] **P2-T04 ESLint and the path alias**
  - Make sure the Vite flat config runs.
  - Add `npm run lint`.
  - Configure the `@/` → `src/` alias in Vite (and in `jsconfig.json` for VS Code IntelliSense).
- [x] **P2-T05 Feature-based structure**
  - Create the folders from `ARCHITECTURE.md` §3, with only the files the phase needs (no empty placeholder files).
- [x] **P2-T06 i18n foundation**
  - Create `lib/i18n` (provider, `useI18n`, `ar.js`, `en.js`) and the `LanguageSwitch` component.
  - Update `<html lang/dir>` and persist the choice (D-02, FR-40, US-23).
- [x] **P2-T07 React Router**
  - Install `react-router`.
  - Create `AppRoutes.jsx` with `/`, `/dashboard`, `/tasks`, `/analytics`, `/login`, `/register`, `/forgot-password`, `/reset-password`, and `*`.
  - Add placeholder pages with translated headings, and `NotFoundPage` (FR-41).
  - Lesson: routes, `Link` and `NavLink`, nested routes with `<Outlet>`.
- [x] **P2-T08 App layout and navigation**
  - Install `lucide-react`.
  - Create `AppLayout` with `SideNav` (≥ `lg`) and `BottomNav` (< `lg`), the active-link state, and a language switch in the header (US-24).
- [x] **P2-T09 Reusable UI components**
  - Create `components/ui`: Button (variants and loading state), Input (label, error, `aria-describedby`), Card, Dialog (native `<dialog>` with focus handling), ProgressBar, EmptyState, Spinner, Alert, Toast (with an `aria-live` region).
  - Create `ErrorBoundary`.
- [x] **P2-T10 Phase wrap-up**
  - Create the skill `.claude/skills/feature-development/SKILL.md`: how to add a feature following the architecture, i18n, RTL rules, and the component checklist.
  - Update the README run instructions and `PROGRESS.md`.
  - Run the code review, then write the report.
- [x] **P2-T11 Explanation file** (added by D-25, written retroactively on 2026-10-14)
  - Write `docs/phase-reports/PHASE_2_EXPLAINED.md`.

### Acceptance criteria
- `npm run dev`, `npm run build`, and `npm run lint` all succeed.
- Every route renders inside the layout. The unknown route shows Not Found.
- The language switch flips text and direction and persists the choice.
- Layouts work at 360px, 768px, and 1280px.
- Components are keyboard-operable.

### Tests
- A manual check of routes, the language switch, and the responsive layout (`TESTING_PLAN.md` §5).
- Automated tests start in P3-T01.

### Deliverables
A working frontend skeleton with navigation.

### Definition of Done
- The acceptance criteria are met.
- Lint is clean.
- The documents are updated.
- The report has been delivered.
- `docs/phase-reports/PHASE_2_EXPLAINED.md` is written (D-25; retroactively, 2026-10-14).

### Risks
- Tailwind v4 configuration differs from v3 tutorials. Mitigation: follow the official v4 Vite guide.
- RTL mistakes from physical classes. Mitigation: logical utilities only, checked by the reviewer.
- Scaffolding into a non-empty folder. Mitigation: the temporary-folder approach in P2-T02.

### Approval checkpoint
The owner runs the app locally, reviews the look and feel, and approves Phase 3.

---

## PHASE 3 — Task Management (mock data)

- **Objective:** full task management backed by the localStorage mock service.
- **Dependencies:** Phase 2.
- **New concepts:** Vitest and React Testing Library, Context with custom hooks, optimistic updates, controlled forms.
- **Estimated effort:** 5–6 sessions.

### Tasks
- [x] **P3-T01 Testing setup**
  - Install `vitest`, `jsdom`, `@testing-library/react`, `@testing-library/user-event`, and `@testing-library/jest-dom`.
  - Add a `test` block to `vite.config.js`, plus `src/test/setup.js` and `src/test/factories.js`.
  - Add the scripts `test` and `test:run`.
  - Create the skill `.claude/skills/testing-conventions/SKILL.md`.
- [x] **P3-T02 Date helpers**
  - Create `src/lib/dates.js`: `todayLocal`, `toDateString`, `parseDate`, `addDays`, `startOfWeek`, `isValidDateString`, `WEEK_STARTS_ON`. All arithmetic uses UTC (D-10).
  - Create `src/lib/useToday.js`, which rolls over at midnight and on focus or visibility change (BR-10).
  - Tests: UT-01, and CT-09 (the `LanguageSwitch` from Phase 2).
- [x] **P3-T03 Service layer and mock tasks service**
  - Create `services/errors.js`, `services/index.js` (selection by `VITE_DATA_SOURCE`, default `mock`), `services/mock/mockTasksService.js`, and `mockAuthService.js` (fixed demo user).
  - Add `.env.example`.
  - Tests: UT-08.
- [x] **P3-T04 Validation and selectors**
  - Create `features/tasks/lib/taskValidation.js` and `taskSelectors.js`.
  - Tests: UT-02 and UT-03.
- [x] **P3-T05 Tasks state**
  - Create `TasksContext.js`, `TasksProvider.jsx`, and `useTasks.js` (D-27): load, create, update, toggle, delete, with optimistic updates and rollback, and `loading`/`error` states.
- [x] **P3-T06 Create task**
  - Create `TaskForm` (US-07).
  - Tests: CT-01.
- [x] **P3-T07 List and toggle**
  - Create `TaskList` and `TaskItem`, with completion toggling (US-10, US-11) and empty, loading, and error states.
  - Tests: CT-02.
- [x] **P3-T08 Edit and reschedule**
  - Create `TaskEditDialog` (US-08, US-09).
  - Tests: CT-03.
- [x] **P3-T09 Delete**
  - Create `DeleteTaskDialog` (US-12).
  - Tests: CT-04.
- [x] **P3-T10 Date navigation, filtering, overdue**
  - Create `DateNavigator`, `StatusFilter`, and `OverdueSection` with "Move to today" (US-13 to US-16).
  - Tests: CT-05.
- [x] **P3-T11 Integration and wrap-up**
  - Tests: IT-01, IT-04, and IT-05 (routing part).
  - Run the manual script, steps 3–5.
  - Run the review, write `PHASE_3_EXPLAINED.md`, and write the report.

### Acceptance criteria
- The acceptance criteria of US-07 to US-16 and US-25 (P3 part) are met.
- `npm run test:run` and `npm run lint` pass.

### Tests
UT-01 to UT-03, UT-08, CT-01 to CT-05, CT-09, IT-01, IT-04, IT-05 (routing part).

### Deliverables
Functional task management without a backend.

### Definition of Done
- The tests have been run and pass, with the output recorded.
- The documents are updated.
- The report has been delivered.
- `docs/phase-reports/PHASE_3_EXPLAINED.md` is written (D-25).

### Risks
- Date or time-zone bugs. Mitigation: calendar-date strings and UT-01 edge cases.
- Rollback complexity. Mitigation: a single, tested pattern in `TasksProvider`.

### Approval checkpoint
The owner manages tasks in the browser and approves Phase 4.

---

## PHASE 4 — Dashboard & Analytics (mock data)

- **Objective:** a working Dashboard and Analytics, computed from tasks by the business rules.
- **Dependencies:** Phase 3.
- **New concepts:** pure functions and `useMemo`, Recharts, `React.lazy` and `Suspense`.
- **Estimated effort:** 4–5 sessions.

### Tasks
- [ ] **P4-T01 Development seed data**
  - Add a dev-only helper that fills the mock with about 10 weeks of realistic tasks. It is never included in production builds.
- [ ] **P4-T02 Daily stats**
  - Create `src/lib/stats.js` (BR-01, BR-06) and `features/dashboard/lib/motivation.js` (BR-13).
  - Tests: UT-04.
- [ ] **P4-T03 Weekly stats and comparison**
  - Create `weeklyStats.js` (BR-02 to BR-04, 8-week history).
  - Tests: UT-05.
- [ ] **P4-T04 Personal best**
  - Create `personalBest.js` (BR-05).
  - Tests: UT-06.
- [ ] **P4-T05 Dashboard page**
  - Create `TodaySummary`, `ProgressCard`, `MotivationMessage`, and `OverdueBanner`, plus today's list with quick add (US-17, US-18).
  - Tests: CT-06, CT-07, IT-02, IT-06.
- [ ] **P4-T06 Introduce Recharts**
  - Install `recharts`.
  - Create `DailyChart` (current vs. previous week) and `TrendChart` (8 weeks), each with a text summary (NFR-44) and RTL-aware layout.
- [ ] **P4-T07 Analytics page**
  - Create `WeekComparison`, `PersonalBest`, and `CalculationInfo`, with empty states. Lazy-load the route (NFR-03) (US-19 to US-22).
  - Tests: CT-08, IT-03.
- [ ] **P4-T08 Wrap-up**
  - Run the manual script, step 6.
  - Check performance against NFR-04 with 5k seeded tasks.
  - Run the review, write `PHASE_4_EXPLAINED.md`, and write the report.

### Acceptance criteria
- The acceptance criteria of US-17 to US-22 are met.
- Every BR-01 to BR-06 and BR-13 has passing unit tests.

### Tests
UT-04 to UT-06, CT-06 to CT-08, IT-02, IT-03, IT-06.

### Deliverables
A working Dashboard and Analytics with mock data.

### Definition of Done
- The tests pass.
- The calculations have been checked against hand-calculated examples.
- The report has been delivered.
- `docs/phase-reports/PHASE_4_EXPLAINED.md` is written (D-25).

### Risks
- Chart accessibility and RTL in Recharts. Mitigation: text summaries and explicit axis configuration.
- Bundle size. Mitigation: lazy route.

### Approval checkpoint
The owner reviews the analytics with seeded data, confirms that the business rules feel right, and approves Phase 5.

---

## PHASE 5 — Supabase & Authentication

- **Objective:** a real multi-user MVP backed by Supabase, with RLS.
- **Dependencies:** Phase 4. The owner creates a free Supabase account and project (the owner's action, at no cost).
- **New concepts:** what a backend-as-a-service is, PostgreSQL tables, constraints, and indexes, authentication and sessions, RLS, environment variables.
- **Estimated effort:** 5–7 sessions.

### Tasks
- [ ] **P5-T01 Supabase fundamentals and client**
  - Lesson.
  - Install `@supabase/supabase-js`.
  - Create `services/supabase/supabaseClient.js` and update `.env.example`. The owner creates `.env.local` from `.env.example` and fills in the values; Claude never reads it (D-20).
- [ ] **P5-T02 Database migration**
  - Lesson: PostgreSQL basics.
  - Create `supabase/migrations/0001_create_tasks.sql` from `DATABASE_SCHEMA.md`, checked against the current Supabase docs.
  - The owner applies it in the SQL Editor, guided step by step.
- [ ] **P5-T03 Auth service and context**
  - Create `supabaseAuthService.js`, `AuthContext.jsx`, and `useAuth.js`, with session restore and `onAuthStateChange` (US-04).
- [ ] **P5-T04 Register and login**
  - Create `RegisterForm`, `LoginForm`, and `authValidation.js` (US-01, US-02, D-18).
  - Enable "Confirm email" and set the Site URL and redirect URLs in Supabase Auth (the owner, guided step by step).
  - Tests: UT-07, CT-10.
- [ ] **P5-T05 Protected routes and logout**
  - Create `ProtectedRoute` and `PublicOnlyRoute`, and add logout to the layout (US-03, US-05).
  - Tests: IT-05.
- [ ] **P5-T06 Supabase tasks service**
  - Create `supabaseTasksService.js`: mapping, pagination, and error mapping to `ServiceError`.
  - Switch `VITE_DATA_SOURCE` to `supabase`. Keep the mock for tests.
- [ ] **P5-T07 Password reset**
  - Add `requestPasswordReset` and `updatePassword` to both auth services.
  - Create `ForgotPasswordPage`, `ResetPasswordPage`, `ForgotPasswordForm`, and `ResetPasswordForm` (US-26, D-19).
  - Tests: UT-07 (VR-05), CT-11, IT-05 (new routes).
- [ ] **P5-T08 Verification**
  - Run ST-01 to ST-10 with two accounts.
  - Check persistence across browsers (US-06, US-25).
  - Run the review, write `PHASE_5_EXPLAINED.md`, and write the report.

### Acceptance criteria
- US-01 to US-06, US-26, and US-25 (P5 part) are met.
- All ST tests pass.
- No secrets are in the repository.

### Tests
UT-07, CT-10, CT-11, IT-05, ST-01 to ST-10.

### Deliverables
A functional multi-user MVP connected to a real database.

### Definition of Done
- Security tests pass and are documented.
- The mock is still usable for tests.
- The report has been delivered.
- `docs/phase-reports/PHASE_5_EXPLAINED.md` is written (D-25).

### Risks
- RLS misconfiguration. Mitigation: ST tests and the Security Advisor.
- Email-confirmation and reset-link redirect issues. Mitigation: configure the Site URL and redirect URLs early.
- The built-in email sender's hourly limit slows testing. Mitigation: disable "Confirm email" temporarily while developing (D-18) and space out reset tests. A custom SMTP provider needs owner approval.
- The default 1000-row limit. Mitigation: pagination in `listTasks`.

### Approval checkpoint
The owner tests with two accounts and approves Phase 6.

---

## PHASE 6 — Testing & Deployment

- **Objective:** a deployed, verified Beta release.
- **Dependencies:** Phase 5. The owner has a Vercel account (free Hobby plan) and a GitHub repository.
- **New concepts:** production builds, environment variables on Vercel, SPA rewrites, Lighthouse.
- **Estimated effort:** 3–4 sessions.

### Tasks
- [ ] **P6-T01 Critical journey tests**
  - Complete IT-01 to IT-06 against the final code and run the full manual script.
- [ ] **P6-T02 Analytics accuracy**
  - Run a hand-calculated dataset through the Supabase build and compare the results.
- [ ] **P6-T03 Security review**
  - Repeat ST-01 to ST-10, run `npm audit`, scan for secrets, and review the RLS policies.
- [ ] **P6-T04 Responsive and RTL review**
  - Go through `TESTING_PLAN.md` §5 and fix the issues found.
- [ ] **P6-T05 Accessibility review**
  - Go through §6, run Lighthouse and keyboard passes, and fix the issues found.
- [ ] **P6-T06 Performance**
  - Check NFR-01 and NFR-03, the bundle size, and the Lighthouse Performance score.
- [ ] **P6-T07 Production configuration**
  - Add `vercel.json` with the SPA rewrite.
  - Prepare the environment-variable checklist and the Supabase Auth URLs for production.
- [ ] **P6-T08 Deploy**
  - **This requires explicit owner approval.** Connect the GitHub repository to Vercel, set the environment variables, deploy, and run a smoke test.
- [ ] **P6-T09 Beta checklist**
  - Complete `TESTING_PLAN.md` §8, finalize the README, write `PHASE_6_EXPLAINED.md`, and write the final report.

### Acceptance criteria
The Release Acceptance Criteria in `MVP_SCOPE.md` are fully met.

### Tests
All test suites in `TESTING_PLAN.md`.

### Deliverables
A deployed MVP ready for initial real users.

### Definition of Done
- The Beta checklist is complete.
- The production URL works.
- The documents are final.
- `docs/phase-reports/PHASE_6_EXPLAINED.md` is written (D-25).

### Risks
- Environment differences between local and production. Mitigation: a preview deployment before production.
- Auth redirect URLs. Mitigation: include them in the checklist.

### Approval checkpoint
The owner approves the Beta launch.
