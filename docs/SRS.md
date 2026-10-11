# Software Requirements Specification (SRS)

Business rules are defined in `PRD.md` (BR-xx) and referenced here by ID only. Service signatures are in `API_CONTRACTS.md`.

## 1. Functional Requirements

### Authentication (Phase 5)
- **FR-01** The system shall let a visitor register with an email address and a password (validation: VR-01 and VR-02).
- **FR-02** The system shall let a registered user log in with email and password.
- **FR-03** The system shall let an authenticated user log out from any app page. Logging out clears the session and returns the user to `/login`.
- **FR-04** The system shall restore a valid session when the app loads, without asking the user to log in again.
- **FR-05** The system shall redirect unauthenticated access to protected routes (`/dashboard`, `/tasks`, `/analytics`) to `/login`, and after login return the user to the originally requested route.
- **FR-06** The system shall redirect authenticated users away from `/login`, `/register`, and `/forgot-password` to `/dashboard`.
- **FR-07** The system shall show distinct, non-revealing messages for invalid credentials, an unconfirmed email, and network failure. With email confirmation enabled (D-18), registration shows the same "check your email" screen whether or not the email is already registered.
- **FR-08** The system shall let a visitor request a password reset email from `/forgot-password`. The response message is the same whether or not the email is registered (D-19).
- **FR-09** The system shall let a user who opens a valid reset link set a new password at `/reset-password` (VR-02, VR-05), then log the user in. An invalid or expired link shows an error with a way to request a new one.

### Tasks (Phase 3)
- **FR-10** The system shall create a task with a title and a `task_date`, owned by the current user, with status pending (BR-14 for the date range).
- **FR-11** The system shall list the current user's tasks for a selected date. The default date is today. Ordering follows PRD F2.
- **FR-12** The system shall let the user change the selected date: previous day, next day, today, or any date chosen in a date picker.
- **FR-13** The system shall filter the listed tasks by status: all, pending, or completed.
- **FR-14** The system shall let the user edit a task's title and date (BR-08).
- **FR-15** The system shall toggle a task between pending and completed (BR-12).
- **FR-16** The system shall delete a task after explicit confirmation (BR-07).
- **FR-17** The system shall list overdue tasks (BR-09) and provide a "Move to today" action.

### Dashboard (Phase 4)
- **FR-20** The system shall show today's tasks with completion toggles and a quick-add form.
- **FR-21** The system shall show today's completed, remaining, and total counts, and the completion rate (BR-01, BR-06).
- **FR-22** The system shall show a progress indicator that reflects today's rate.
- **FR-23** The system shall show a motivating message (BR-13).
- **FR-24** The system shall show the number of overdue tasks with a link to manage them.

### Analytics (Phase 4)
- **FR-30** The system shall show this-week-to-date vs. last-week-to-date counts, rates, and deltas (BR-02, BR-03, BR-04).
- **FR-31** The system shall show a per-day chart of completed and total tasks for the current and previous weeks.
- **FR-32** The system shall show an 8-week trend of weekly completed counts and rates.
- **FR-33** The system shall show the personal best day and week (BR-05).
- **FR-34** The system shall show a short explanation of how the statistics are calculated.

### General (Phase 2)
- **FR-40** The system shall let the user switch the UI language between Arabic (RTL) and English (LTR). The choice persists in the browser (D-02).
- **FR-41** The system shall show a Not Found page for unknown routes.

## 2. Non-Functional Requirements

### Performance
- **NFR-01** Largest Contentful Paint (LCP) under 2.5 s on a mid-range mobile device over 4G for the Dashboard, measured with a Lighthouse mobile run.
- **NFR-02** UI feedback for task actions within 100 ms, using optimistic updates for create, toggle, and delete. The server round-trip may take longer. Saves from the edit dialog wait for the server and show a loading state instead.
- **NFR-03** The Analytics route is lazy-loaded so the charting library is not part of the initial bundle.
- **NFR-04** Analytics calculations finish in under 50 ms for 5,000 tasks (D-09).

### Security
- **NFR-10** Row Level Security is enabled on every table, and policies restrict all operations to `auth.uid() = user_id` (`DATABASE_SCHEMA.md`).
- **NFR-11** Only the Supabase project URL and the public anon or publishable key may appear in frontend code or environment variables. The service-role or secret key must never be used in the frontend or committed to the repository.
- **NFR-12** Secrets live in `.env.local`, which is git-ignored. `.env.example` lists variable names only.
- **NFR-13** The UI never renders user content as HTML (no `dangerouslySetInnerHTML`).
- **NFR-14** Error messages shown to users never include raw database or stack details.
- **NFR-15** Authentication sessions are managed by `supabase-js`. The app never stores passwords.

### Reliability and Data Integrity
- **NFR-20** Database constraints enforce the title length, status values, and the status/completed_at consistency rule (BR-12), whatever the client sends.
- **NFR-21** When an optimistic update fails on the server, the UI rolls it back and shows an error.

### Compatibility and Responsiveness
- **NFR-30** The latest two versions of Chrome, Edge, Firefox, and Safari, on desktop and mobile.
- **NFR-31** Usable layouts from 360px to 1920px wide, with no horizontal scrolling.

### Accessibility
- **NFR-40** Target WCAG 2.2 Level AA.
- **NFR-41** Every interactive element is reachable and operable by keyboard, with a visible focus indicator.
- **NFR-42** Every form field has a programmatic label. Errors are linked with `aria-describedby` and announced.
- **NFR-43** Text contrast is at least 4.5:1 (3:1 for large text and UI components).
- **NFR-44** The progress indicator exposes its value (for example `role="progressbar"` with `aria-valuenow`). Every chart has a text alternative or summary.
- **NFR-45** Animations respect `prefers-reduced-motion`.
- **NFR-46** `<html lang>` and `dir` update when the language changes.

### Maintainability
- **NFR-50** JavaScript and JSX only, with no TypeScript. ESLint passes with no errors.
- **NFR-51** UI components do not import the Supabase client. Data access goes only through `src/services/` (D-08).
- **NFR-52** Business rules are implemented as pure functions with unit tests.

## 3. Validation Rules

- **VR-01 Email:** required, trimmed, valid email format, at most 254 characters.
- **VR-02 Password (register and new password on reset):** required, 8 to 72 characters. **Login:** required.
- **VR-03 Task title:** required, trimmed, 1 to 200 characters after trimming. Duplicate titles are allowed.
- **VR-04 Task date:** required, valid `YYYY-MM-DD`, within the range in BR-14.
- **VR-05 Password confirmation (reset):** required and identical to the new password.
- Validation runs on the client for fast feedback.
  - VR-03, the status values, and BR-12 are enforced again by database constraints (NFR-20).
  - VR-04 is client-only, because "today" depends on the user's time zone (BR-10).
  - VR-01 and VR-02 are also enforced by Supabase Auth. VR-05 is client-only. The client validators live in `features/*/lib/` and are unit-tested.

## 4. Error Handling

- Services throw a `ServiceError` with a stable `code` (`API_CONTRACTS.md`). Hooks catch it and expose an `error` state. Components map codes to translated messages.
- **Network errors:** a message with a Retry action. Optimistic changes are rolled back (NFR-21).
- **`UNAUTHENTICATED` (expired session):** redirect to `/login` with a "Session expired" notice. Exception: on `/reset-password`, it shows the "Link invalid or expired" state instead (D-19).
- **`RATE_LIMITED`:** a "Too many attempts, try again later" message.
- **`NOT_FOUND` (for example, a task deleted in another tab):** remove the task locally and show a short notice.
- **Unexpected errors:** a generic message. Details are logged to the console in development only.
- A top-level React error boundary shows a recovery screen instead of a blank page.

## 5. Constraints and Assumptions

- Technology stack as defined in `ARCHITECTURE.md`. Changing it requires owner approval.
- The Supabase free tier is sufficient for the Beta. Any paid change requires approval.
- The browser's clock and time zone are trusted for "today" (BR-10).
