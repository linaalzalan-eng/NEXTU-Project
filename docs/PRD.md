# Product Requirements Document (PRD)

Vision and goals: `PROJECT_INTENT.md`. Scope boundaries: `MVP_SCOPE.md`. Detailed requirements: `SRS.md`.
**This document is the single source of truth for business rules (BR-xx).**

## 1. Product Overview

NEXTU is a personal productivity web app. Users plan dated tasks, complete them, and see their progress compared with their own past performance. The app has four main areas:

- **Dashboard** (`/dashboard`): the default screen after login, focused on today.
- **Tasks** (`/tasks`): manage tasks for any date.
- **Analytics** (`/analytics`): weekly comparisons, personal bests, and history charts.
- **Auth** (`/login`, `/register`, `/forgot-password`, `/reset-password`): account access.

## 2. Core Features and Functional Expectations

### F1 — Authentication
- Register and log in with email and password. Log out from any app page.
- New accounts confirm their email address before the first login (D-18).
- A user who forgot the password can set a new one through an emailed link (D-19).
- The session persists across browser restarts until the user logs out.
- An unauthenticated user who visits an app page is redirected to `/login`, and returned to the requested page after login.
- An authenticated user who visits `/login`, `/register`, or `/forgot-password` is redirected to `/dashboard`.

### F2 — Task Management
- Create a task with a title and a date. The date defaults to the date currently being viewed, which is today by default.
- Edit a task's title and date. Changing the date reschedules the task (BR-08).
- Toggle a task between pending and completed (BR-12).
- Delete a task after confirmation (BR-07).
- Navigate between dates: previous day, next day, "Today", and a date picker.
- Filter the visible list by status: All, Pending, or Completed. The default is All.
- Overdue tasks are shown in their own section with a one-click "Move to today" action (BR-09).
- Within a day, pending tasks appear before completed tasks, each group ordered by creation time.

### F3 — Daily Dashboard
- Today's date and today's tasks, with inline completion toggling and quick add.
- Counters: completed, remaining, and total tasks for today.
- Today's completion percentage (BR-01) shown as a number and as an accessible progress indicator.
- A motivating message based on today's progress (BR-13).
- An overdue summary with a link to the Tasks page.

### F4 — Achievement Analytics
- **This week vs. last week:** completed count and completion rate for each, plus the difference (BR-02, BR-03, BR-04).
- **Daily breakdown:** completed and total per day for the current week and the previous week, shown as a chart.
- **Trend:** weekly completed count and rate for the last 8 weeks, shown as a chart.
- **Personal best:** best day and best week by completed count (BR-05).
- A short line explains how the numbers are calculated (Philosophy principle 3).

### F5 — Data Persistence
- Tasks are stored per user and remain available across sessions and devices.
- A user can never see or change another user's tasks. This is enforced by the database through RLS, not only by the UI.

## 3. User Experience Requirements

- **Tone:** encouraging and calm. Never shame the user. Low results are framed as a starting point.
- **Speed:** adding a task takes at most one text field, an Enter key press, and an optional date change.
- **Clarity:** every number has a label and, where useful, a tooltip or help text explaining its formula.
- **Feedback:** every action shows a visible result (an optimistic update or a toast). Errors are shown in plain language with a retry option.
- **States:** every data view has a loading state, an empty state, and an error state (see `USER_FLOW.md`).
- **Language:** Arabic (RTL) by default with an English (LTR) switch. Task titles render in their own direction (`dir="auto"`). See D-02.
- **Responsive:** designed mobile-first. Navigation is a bottom bar on small screens and a sidebar on large screens.
- **Accessibility:** works with keyboard only, labels form fields, has visible focus, respects reduced-motion preferences, and gives charts a text summary.

## 4. Business Rules

> **Important note:** The completion percentage measures **plan adherence**, meaning how much of what you planned you completed. It does **not** measure productivity, effort, or task difficulty. Completing 5 of 5 small tasks is not "better" than completing 2 of 3 hard ones. The UI says this once, in the Analytics explanation. Weighted scoring is a possible future feature.

Definitions used below:
- A task **belongs to day D** when its `task_date` equals D.
- **Today** is the current calendar date in the browser's local time zone (BR-10).
- **Rate** values are integer percentages from 0 to 100, rounded with `Math.round`, or `null` when there is no data. Two exceptions keep the number honest:
  - A partial result (`0 < completed < total`) is clamped to the range 1–99. Rounding never shows 100% while a task is still pending, and never shows 0% after a task is done.
  - Rate deltas subtract these displayed (rounded) rates.

**BR-01 — Daily completion rate**
`rate(D) = completed(D) / total(D) × 100`, counting the tasks that belong to day D. If `total(D) = 0`, the rate is `null` (BR-06). The day a task was actually completed (`completed_at`) does not affect which day it counts for.

**BR-02 — Weekly completion rate**
`rate(W) = Σ completed / Σ total` over all tasks that belong to the days of week W. This aggregates tasks; it is **not** the average of daily rates, so a day with 1 task does not weigh the same as a day with 10. If the week has no tasks, the rate is `null`.

**BR-03 — Week definition**
A week runs from **Saturday to Friday** on the calendar (D-13). "This week" is the week containing today.

**BR-04 — This week vs. last week**
The comparison is fair to date. "This week to date" covers Saturday through today. "Last week to date" covers the same weekdays, exactly 7 days earlier.
- Shown values: completed count for each, rate for each, `completedDelta = current − previous` as an absolute number, and `rateDelta = currentRate − previousRate` in percentage points.
- If either rate is `null`, `rateDelta` is `null` and the UI shows "Not enough data". The app never shows ∞% or a misleading relative percentage.
- Charts that show full weeks are labeled clearly as full weeks and are not used for the "to date" comparison.
- The "This week" summary cards (US-19) also use the to-date window, so pending tasks planned for later days do not lower this week's rate. Only the charts (FR-31, FR-32) use full weeks.
- **Accepted bias:** today is still in progress, while the same weekday last week is finished, so early in the day this week can look slightly worse. This is accepted for simplicity, and the UI label says "so far".

**BR-05 — Personal best**
- **Best day:** the day up to and including today with the highest number of completed tasks.
- **Best week:** the week up to and including the current week with the highest number of completed tasks.
- Only tasks with `task_date <= today` are considered, for both the best day and the best week. Completed tasks dated in the future are ignored until their day arrives.
- Ties go to the most recent date or week. Both are `null` until at least one task has been completed.
- Personal bests use counts, not rates, because 1 of 1 = 100% is easy and misleading.
- `isTodayBest = bestDay !== null && bestDay.date === today`, and `isThisWeekBest = bestWeek !== null && bestWeek.weekStart === currentWeekStart`. Because ties go to the most recent date, "matching" the record counts as being the best. When either value is true, the UI shows a positive highlight. This is a message, not a badge.

**BR-06 — Days and weeks with zero tasks**
They have `rate = null`, displayed as "No tasks" or "—" and never as 0%. They are excluded from rate calculations and do not count as failures. Count values (completed, total) still show 0. Charts show them as empty slots.

**BR-07 — Deleted tasks**
Deletion is permanent (D-12). A deleted task disappears from all statistics, including past days, weeks, and personal bests. The confirmation dialog states this.

**BR-08 — Rescheduled tasks**
Changing a task's date moves it completely. It counts only toward its current `task_date`, and no history of earlier dates is kept. Completed tasks may also be rescheduled; their `completed_at` does not change.

**BR-09 — Overdue tasks**
A task is overdue when `status = 'pending'` and `task_date < today`.
- Overdue tasks are **not** moved automatically. They keep counting toward their original day, where they lower that day's rate, until the user completes or reschedules them.
- The Tasks page and the Dashboard show an overdue section. "Move to today" sets `task_date = today`.
- A task completed late still counts as completed for its original day (BR-01).

**BR-10 — Time zone handling**
- `task_date` is a calendar date with no time or time zone (SQL `DATE`, JS `"YYYY-MM-DD"` string; see D-10).
- `created_at`, `updated_at`, and `completed_at` are absolute instants (SQL `timestamptz`, stored in UTC).
- "Today" and week boundaries are computed from the browser's local calendar date. The server never decides what "today" is.
- "Today" is recomputed when the window regains focus or becomes visible, and at local midnight. A page left open overnight therefore moves to the new day.

**BR-11 — Historical data consistency**
Statistics are always computed from the user's current tasks. No snapshots are stored (D-09). Editing, rescheduling, completing, or deleting a task in the past changes past statistics immediately. This is intended: the numbers always match the visible tasks.

**BR-12 — Completion state**
Marking a task completed sets `status = 'completed'` and `completed_at` to the current time. Marking it pending again sets `status = 'pending'` and `completed_at = null`. The database enforces that `completed_at` is set **if and only if** the status is completed.

**BR-13 — Motivating message (daily)**
The message is selected from today's counts. The edges are decided from the raw counts (`completed === 0`, `completed === total`), never from a rounded number. Between the edges, the band follows the displayed rate, so the message always matches the number the user sees (for example, 99/200 is shown as 50% and gets the 50–99 message; D-28). In display-rate terms:
- `null` (no tasks today): invite the user to plan the day.
- `0`: encourage the first step.
- `1–49`: acknowledge the start and encourage momentum.
- `50–99`: praise the progress and say the goal is close.
- `100`: celebrate a completed plan.

Messages are translated, short, never negative, and never compare the user with other people.

**BR-14 — Task date range**
`task_date` must be a valid date between `2000-01-01` and today + 365 days. Past dates are allowed, so a user can log what they already did.

## 5. MVP Acceptance Criteria

Feature-level acceptance criteria are defined per story in `USER_STORIES.md`. Release acceptance is defined in `MVP_SCOPE.md`.
