# MVP Scope

The single source of truth for what the first release contains. Feature details are in `PRD.md`. Stories are in `USER_STORIES.md`.

## Included

1. **Authentication:** register (with email confirmation), log in, and log out with email and password. Reset a forgotten password by email. Sessions persist. App pages are protected. Each user can access only their own data.
2. **Task management:** create, edit (title and date), and delete tasks; mark tasks completed or pending; assign a date; view today's tasks or any other date; filter by status (all / pending / completed); see overdue tasks and move one to today.
3. **Daily dashboard:** today's tasks; completed, remaining, and total counts; daily completion percentage; a progress indicator; a motivating message.
4. **Achievement analytics:** daily and weekly statistics; this week vs. the previous week; personal best day and week; charts of recent history.
5. **Data persistence:** tasks are stored in Supabase PostgreSQL with Row Level Security.
6. **Cross-cutting:** responsive layout from 360px wide; Arabic RTL as default with an English LTR switch; accessible UI (WCAG 2.2 AA target).

## Excluded (not in MVP)

- AI recommendations or insights.
- Gamification: badges, streak rewards, points, challenges.
- Pomodoro timer or time tracking.
- Social features, leaderboards, sharing, teams, collaboration.
- Payments or subscriptions.
- Native mobile apps (a responsive web app is enough).
- Task descriptions, priorities, categories, tags, difficulty weighting, attachments.
- Recurring tasks, reminders, notifications, calendar sync.
- OAuth or social login.
- Offline mode, PWA installation.
- Data export or import.
- Admin dashboard.

## MVP Limitations (accepted)

- Completion percentage measures plan adherence, not effort or difficulty (see BR-01 note in `PRD.md`).
- "Today" follows the browser's time zone. A user travelling across time zones may see "today" shift (BR-10).
- Deleted tasks are permanently removed, including from past statistics (BR-07).
- Rescheduling history is not kept (BR-08).
- The language preference is stored per browser, not per account (D-04).
- Analytics are computed on the client. This is fine for up to about 10k tasks per user (D-09).
- Confirmation and password-reset emails use Supabase's built-in sender, which has a low hourly limit on the free plan (D-18).

## Release Acceptance Criteria (Beta)

The MVP is releasable when all of the following are true:

1. Every **Must** user story in `USER_STORIES.md` meets its acceptance criteria.
2. Automated tests pass (`npm run test:run`) and lint is clean (`npm run lint`).
3. Unit tests cover every business rule BR-01 to BR-14 that has calculation or validation logic. BR-07, BR-08, BR-11, and BR-12 are covered through service and integration tests.
4. A two-account test confirms that user A cannot read, update, or delete user B's tasks (`TESTING_PLAN.md`, security section).
5. No secret or service-role key exists in the repository or in the production bundle.
6. The app works at 360px, 768px, and 1280px widths, in both RTL and LTR.
7. Keyboard-only navigation completes the critical journeys. Lighthouse Accessibility score is at least 90.
8. The app is deployed on Vercel with production environment variables, and a smoke test passes.
9. The release checklist in `TESTING_PLAN.md` is fully checked.
