# User Stories

Role: **User** is an individual using the app. **Visitor** is someone who is not logged in.
IDs are never renumbered: stories added later (such as US-26) are placed in their topic section.
Priority uses MoSCoW: **Must**, **Should**, **Could**. Phase refers to `IMPLEMENTATION_PLAN.md`. Business rules (BR-xx) are in `PRD.md`.

---

## Authentication

### US-01 — Register
- **Role:** Visitor · **Priority:** Must · **Phase:** P5
- **Story:** As a visitor, I want to create an account with my email and password so that my tasks are saved privately.
- **Acceptance criteria:**
  - [ ] Invalid email or password shows inline errors (VR-01, VR-02) and nothing is submitted.
  - [ ] With email confirmation on (D-18), registration shows the same "check your email" screen whether or not the email was already registered.
  - [ ] With confirmation off (development only), an already registered email shows a clear message, and a new account is logged in and sent to `/dashboard`.

### US-02 — Log in
- **Role:** Visitor · **Priority:** Must · **Phase:** P5
- **Story:** As a registered user, I want to log in so that I can access my tasks.
- **Acceptance criteria:**
  - [ ] Valid credentials lead to the originally requested page, or to `/dashboard`.
  - [ ] Invalid credentials show one generic message that does not reveal whether the email exists.
  - [ ] Logging in before confirming the email shows a message asking the user to confirm it first (D-18).
  - [ ] The login page links to "Forgot password?" (US-26).
  - [ ] The submit button shows a loading state and prevents double submission.

### US-03 — Log out
- **Role:** User · **Priority:** Must · **Phase:** P5
- **Story:** As a user, I want to log out so that nobody else using this device can see my data.
- **Acceptance criteria:**
  - [ ] Log out is available from the app layout on every protected page.
  - [ ] After logging out, pressing the browser's Back button does not show protected data.

### US-04 — Stay logged in
- **Role:** User · **Priority:** Must · **Phase:** P5
- **Story:** As a user, I want to stay logged in after closing the browser so that I don't have to log in every day.
- **Acceptance criteria:**
  - [ ] Reopening the app with a valid session goes straight to the requested page.
  - [ ] While the session is being restored, a loading screen is shown, not a login-page flash.

### US-05 — Protected pages
- **Role:** Visitor · **Priority:** Must · **Phase:** P5 (routes in P2)
- **Story:** As a visitor, I should be redirected to login when I open an app page so that private pages stay private.
- **Acceptance criteria:**
  - [ ] Visiting `/dashboard`, `/tasks`, or `/analytics` without a session redirects to `/login`.
  - [ ] A logged-in user visiting `/login`, `/register`, or `/forgot-password` is redirected to `/dashboard`.

### US-06 — Private data
- **Role:** User · **Priority:** Must · **Phase:** P5
- **Story:** As a user, I want my tasks to be visible only to me so that my data stays private.
- **Acceptance criteria:**
  - [ ] With two test accounts, account A cannot read, update, or delete account B's tasks, even through direct API calls (`TESTING_PLAN.md`, ST-01 to ST-04).

### US-26 — Reset a forgotten password
- **Role:** Visitor · **Priority:** Must · **Phase:** P5
- **Story:** As a registered user who forgot my password, I want to set a new one through my email so that I can get back into my account.
- **Acceptance criteria:**
  - [ ] `/forgot-password` accepts an email (VR-01). After submitting, it always shows the same "If an account exists, we sent a link" message, whether or not the email is registered.
  - [ ] The link in the email opens `/reset-password`, where the user enters and confirms a new password (VR-02, VR-05).
  - [ ] After a successful reset, the user is logged in and sent to `/dashboard`. The old password no longer works.
  - [ ] Opening `/reset-password` without a valid or unexpired link shows "Link invalid or expired" with a link to request a new one.
  - [ ] A user with a normal (non-recovery) session who opens `/reset-password` is redirected to `/dashboard` and cannot change the password there.
  - [ ] Both forms show loading states, inline errors, and network errors like the other auth forms.

---

## Tasks

### US-07 — Create a task
- **Role:** User · **Priority:** Must · **Phase:** P3
- **Story:** As a user, I want to add a task for a date so that I can plan my day.
- **Acceptance criteria:**
  - [ ] Title and date are required (VR-03, VR-04). The date defaults to the date being viewed.
  - [ ] Pressing Enter in the title field submits the form. The field clears and keeps focus for the next task.
  - [ ] The new task appears immediately in the list for its date.

### US-08 — Edit a task title
- **Role:** User · **Priority:** Must · **Phase:** P3
- **Story:** As a user, I want to fix a task's title so that it reflects what I meant.
- **Acceptance criteria:**
  - [ ] An edit dialog opens prefilled. Saving applies the change, and Cancel or Escape discards it.
  - [ ] Validation is the same as creation.

### US-09 — Reschedule a task
- **Role:** User · **Priority:** Must · **Phase:** P3
- **Story:** As a user, I want to move a task to another date so that my plan stays realistic.
- **Acceptance criteria:**
  - [ ] Changing the date in the edit dialog moves the task to that date (BR-08).
  - [ ] Statistics for both the old and the new date update (BR-11).

### US-10 — Complete a task
- **Role:** User · **Priority:** Must · **Phase:** P3
- **Story:** As a user, I want to mark a task as done so that my progress is recorded.
- **Acceptance criteria:**
  - [ ] One click or tap, or Space on a focused checkbox, toggles completion (BR-12).
  - [ ] Completed tasks are visually distinct by more than color alone (strikethrough and an icon).

### US-11 — Undo completion
- **Role:** User · **Priority:** Must · **Phase:** P3
- **Story:** As a user, I want to mark a completed task as not done so that I can correct mistakes.
- **Acceptance criteria:**
  - [ ] Toggling again sets the task back to pending and clears `completed_at` (BR-12).

### US-12 — Delete a task
- **Role:** User · **Priority:** Must · **Phase:** P3
- **Story:** As a user, I want to delete a task so that my list contains only relevant items.
- **Acceptance criteria:**
  - [ ] A confirmation dialog explains that deletion is permanent and affects past statistics (BR-07).
  - [ ] After confirming, the task disappears. Cancelling changes nothing.

### US-13 — View today's tasks
- **Role:** User · **Priority:** Must · **Phase:** P3
- **Story:** As a user, I want to see today's tasks by default so that I can focus on today.
- **Acceptance criteria:**
  - [ ] The Tasks page opens on today, labeled "Today".
  - [ ] If there are no tasks, an empty state invites the user to add one.

### US-14 — Browse other dates
- **Role:** User · **Priority:** Must · **Phase:** P3
- **Story:** As a user, I want to view tasks for other days so that I can plan ahead or review the past.
- **Acceptance criteria:**
  - [ ] Previous, Next, and Today controls plus a date picker change the date shown (FR-12).
  - [ ] Arrow-style controls follow the reading direction in RTL.

### US-15 — Filter by status
- **Role:** User · **Priority:** Must · **Phase:** P3
- **Story:** As a user, I want to filter tasks by status so that I can focus on what is left.
- **Acceptance criteria:**
  - [ ] All, Pending, and Completed filters are available. The active filter is visually and programmatically indicated (`aria-pressed` or tabs).
  - [ ] When a filter returns no results, a filter-specific empty message is shown.

### US-16 — Handle overdue tasks
- **Role:** User · **Priority:** Should · **Phase:** P3
- **Story:** As a user, I want to see unfinished tasks from past days so that nothing is forgotten.
- **Acceptance criteria:**
  - [ ] The overdue section lists pending tasks dated before today (BR-09).
  - [ ] "Move to today" reschedules the task to today in one action.

---

## Dashboard

### US-17 — Today at a glance
- **Role:** User · **Priority:** Must · **Phase:** P4
- **Story:** As a user, I want to see today's completed, remaining, and total counts and percentage so that I know where I stand.
- **Acceptance criteria:**
  - [ ] The counts and the rate match BR-01. With no tasks, the rate shows "—" (BR-06).
  - [ ] The values update immediately when a task is toggled from the Dashboard.

### US-18 — Progress indicator and motivation
- **Role:** User · **Priority:** Must · **Phase:** P4
- **Story:** As a user, I want a visual progress indicator and an encouraging message so that I stay motivated.
- **Acceptance criteria:**
  - [ ] The progress indicator exposes its value to assistive technology (NFR-44).
  - [ ] The message follows the bands in BR-13 in the current language.

---

## Analytics

### US-19 — Weekly statistics
- **Role:** User · **Priority:** Must · **Phase:** P4
- **Story:** As a user, I want to see this week's completed tasks and rate so that I understand my week.
- **Acceptance criteria:**
  - [ ] Weeks run Saturday to Friday (BR-03). The rate is aggregated (BR-02). The summary uses the to-date window, Saturday through today (BR-04).
  - [ ] The per-day chart shows completed and total tasks for each day.

### US-20 — Compare with last week
- **Role:** User · **Priority:** Must · **Phase:** P4
- **Story:** As a user, I want to compare this week with last week so that I know whether I'm improving.
- **Acceptance criteria:**
  - [ ] The comparison is to date (BR-04) and shows the absolute and percentage-point differences, with positive or negative styling that does not rely on color alone.
  - [ ] When data is missing, "Not enough data" is shown instead of a misleading number.

### US-21 — Personal best
- **Role:** User · **Priority:** Must · **Phase:** P4
- **Story:** As a user, I want to see my best day and best week so that I have a personal record to beat.
- **Acceptance criteria:**
  - [ ] The values follow BR-05, including ties and the empty case.
  - [ ] When today or this week equals or beats the record, a highlight is shown.

### US-22 — History trend
- **Role:** User · **Priority:** Should · **Phase:** P4
- **Story:** As a user, I want to see my weekly trend over the last 8 weeks so that I can spot patterns.
- **Acceptance criteria:**
  - [ ] The chart shows 8 weeks, including weeks with no tasks as empty slots (BR-06).
  - [ ] A text summary is available for screen readers.

---

## General

### US-23 — Switch language
- **Role:** User / Visitor · **Priority:** Must · **Phase:** P2
- **Story:** As a user, I want to switch between Arabic and English so that I can use my preferred language.
- **Acceptance criteria:**
  - [ ] Switching changes all UI text and the page direction instantly. The choice persists after a reload.
  - [ ] Task titles keep their own text direction in both languages.

### US-24 — Use on mobile
- **Role:** User · **Priority:** Must · **Phase:** P2 (verified in P6)
- **Story:** As a user, I want the app to work well on my phone so that I can update tasks anywhere.
- **Acceptance criteria:**
  - [ ] All features are usable at 360px width without horizontal scrolling. Touch targets are at least 44×44px.

### US-25 — Data persists
- **Role:** User · **Priority:** Must · **Phase:** P3 (localStorage mock), P5 (database)
- **Story:** As a user, I want my tasks to still be there when I come back so that I can track my history.
- **Acceptance criteria:**
  - [ ] P3: tasks survive a page reload.
  - [ ] P5: tasks are available after logging out and back in, and on another device.
