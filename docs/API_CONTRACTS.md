# API Contracts (JavaScript Service Layer)

These contracts are implemented by both `services/mock/*` and `services/supabase/*` (D-08). UI code imports only from `@/services`.
Every function is `async` unless it is marked as pure. On failure, a function **throws** a `ServiceError`.

## 1. Shared Types (JSDoc)

```js
/**
 * @typedef {'pending' | 'completed'} TaskStatus
 *
 * @typedef {Object} Task
 * @property {string} id            UUID
 * @property {string} userId        UUID of owner
 * @property {string} title         1–200 chars, trimmed
 * @property {TaskStatus} status
 * @property {string} taskDate      Calendar date "YYYY-MM-DD" (BR-10)
 * @property {string} createdAt     ISO 8601 timestamp
 * @property {string} updatedAt     ISO 8601 timestamp
 * @property {string|null} completedAt  ISO timestamp when completed, else null (BR-12)
 *
 * @typedef {Object} User
 * @property {string} id
 * @property {string} email
 *
 * @typedef {Object} Session
 * @property {User} user
 */
```

The Supabase service maps database rows (`task_date`, `completed_at`, ...) to these camelCase objects and back. No other code uses snake_case.

## 2. Errors (`services/errors.js`)

```js
export class ServiceError extends Error {
  /** @param {ErrorCode} code  @param {string} [message]  @param {unknown} [cause] */
  constructor(code, message, cause) { super(message ?? code); this.code = code; this.cause = cause; }
}
```

Error codes (`ErrorCode`):
- `VALIDATION`: input failed VR-xx or a database constraint.
- `UNAUTHENTICATED`: no session, or the session has expired.
- `INVALID_CREDENTIALS`: wrong email or password at login.
- `EMAIL_NOT_CONFIRMED`: login before the email address has been confirmed (D-18).
- `EMAIL_TAKEN`: registration with an email that is already registered. Produced only when email confirmation is disabled (D-18).
- `NOT_FOUND`: the task does not exist or is not visible to this user. RLS makes both cases look the same, which is intended.
- `RATE_LIMITED`: Supabase refused the request because too many emails or attempts were sent recently (D-18). The UI asks the user to try again later.
- `NETWORK`: the server cannot be reached.
- `UNKNOWN`: anything else. The details are kept in `cause` and are never shown to the user (NFR-14).

## 3. Auth Service — `authService`

```js
/** @param {{email: string, password: string}} input
 *  @returns {Promise<{user: User, session: Session|null}>}  session is null if email confirmation is required (D-18)
 *  @throws VALIDATION | EMAIL_TAKEN | RATE_LIMITED | NETWORK | UNKNOWN */
signUp(input)

/** @param {{email: string, password: string}} input
 *  @returns {Promise<Session>}
 *  @throws VALIDATION | INVALID_CREDENTIALS | EMAIL_NOT_CONFIRMED | NETWORK | UNKNOWN */
signIn(input)

/** @returns {Promise<void>}  @throws NETWORK | UNKNOWN */
signOut()

/** @returns {Promise<Session|null>}  restores the persisted session */
getSession()

/** @param {(session: Session|null, event: AuthEvent) => void} callback
 *  @returns {() => void} unsubscribe  (synchronous)
 *  AuthEvent is 'SIGNED_IN' | 'SIGNED_OUT' | 'PASSWORD_RECOVERY' | 'OTHER'.
 *  'PASSWORD_RECOVERY' means the session came from a reset link (D-19). */
onAuthStateChange(callback)

/** D-19. Sends a recovery email whose link opens `/reset-password`.
 *  Resolves the same way whether or not the email is registered (non-revealing).
 *  @param {{email: string}} input
 *  @returns {Promise<void>}
 *  @throws VALIDATION | RATE_LIMITED | NETWORK | UNKNOWN */
requestPasswordReset(input)

/** D-19. Sets a new password. The UI calls it only during a recovery session (`isRecovery` in AuthContext).
 *  @param {{password: string}} input
 *  @returns {Promise<void>}
 *  @throws VALIDATION | UNAUTHENTICATED (missing or expired recovery session) | NETWORK | UNKNOWN */
updatePassword(input)
```

Mock behavior (Phases 3–4): there is always one fixed demo user (`id: 'local-user'`). `signIn`, `signUp`, `requestPasswordReset`, and `updatePassword` resolve immediately. This keeps the shapes identical to the real service.

## 4. Tasks Service — `tasksService`

All functions act **only on the current user's tasks**. Ownership comes from the session (Supabase: database default plus RLS). Callers never pass `userId`.

```js
/** List tasks. All filters are optional; with none, returns the full history.
 *  @param {{from?: string, to?: string, status?: TaskStatus}} [filters]  inclusive "YYYY-MM-DD" bounds
 *  @returns {Promise<Task[]>}  sorted by taskDate asc, then createdAt asc
 *  @throws UNAUTHENTICATED | NETWORK | UNKNOWN */
listTasks(filters)

/** @param {{title: string, taskDate: string}} input
 *  @returns {Promise<Task>}  status 'pending', completedAt null
 *  @throws VALIDATION | UNAUTHENTICATED | NETWORK | UNKNOWN */
createTask(input)

/** Edit title and/or date (reschedule, BR-08). Status changes use setTaskCompletion.
 *  @param {string} id
 *  @param {{title?: string, taskDate?: string}} changes
 *  @returns {Promise<Task>}
 *  @throws VALIDATION | NOT_FOUND | UNAUTHENTICATED | NETWORK | UNKNOWN */
updateTask(id, changes)

/** BR-12: completed=true sets status 'completed' + completedAt=now; false resets both.
 *  @param {string} id  @param {boolean} completed
 *  @returns {Promise<Task>}
 *  @throws NOT_FOUND | UNAUTHENTICATED | NETWORK | UNKNOWN */
setTaskCompletion(id, completed)

/** Permanent delete (BR-07).
 *  @param {string} id  @returns {Promise<void>}
 *  @throws NOT_FOUND | UNAUTHENTICATED | NETWORK | UNKNOWN */
deleteTask(id)
```

Notes:
- Services validate input again with the shared validators in `features/tasks/lib/taskValidation.js` before doing I/O.
- `listTasks()` with no filters paginates internally in the Supabase implementation, because the API returns at most 1000 rows per request (D-09). Paginated reads must use a fully deterministic order, `task_date, created_at, id`, so no row is skipped or duplicated between pages.
- Example:
  ```js
  import { tasksService } from '@/services';
  const task = await tasksService.createTask({ title: 'Read 10 pages', taskDate: '2026-10-11' });
  ```

## 5. Analytics — Pure Functions (no I/O)

"Retrieving analytics" means calling pure functions on the task list that is already loaded (D-09). They never throw for empty input. Every rate is an integer from 0 to 100, or `null` (BR-06).

```js
/** @typedef {{date: string, total: number, completed: number, remaining: number, rate: number|null}} DailyStats */
/** @typedef {{weekStart: string, weekEnd: string, total: number, completed: number, rate: number|null, days: DailyStats[]}} WeeklyStats */

// src/lib/stats.js  (shared by dashboard and analytics)
toRate(completed, total)              // → number|null           (BR-01 rounding/clamping, BR-06)
getDailyStats(tasks, date)            // → DailyStats            (BR-01, BR-06)

// features/dashboard/lib/motivation.js
getMotivationKey({completed, total})  // → i18n key string       (BR-13, decided from raw counts)

// features/analytics/lib/weeklyStats.js
getWeekRange(date)                    // → {weekStart, weekEnd}  Saturday..Friday (BR-03); delegates to startOfWeek in lib/dates.js
getWeeklyStats(tasks, weekStart)      // → WeeklyStats           (BR-02)
compareWeeksToDate(tasks, today)
// → { current: {from, to, completed, total, rate},
//     previous: {from, to, completed, total, rate},
//     completedDelta: number, rateDelta: number|null }       (BR-04)
getWeeklyHistory(tasks, today, weeks = 8) // → WeeklyStats[] oldest→newest, includes empty weeks

// features/analytics/lib/personalBest.js
getPersonalBest(tasks, today)
// → { bestDay: {date, completed}|null, bestWeek: {weekStart, completed}|null,
//     isTodayBest: boolean, isThisWeekBest: boolean }        (BR-05; only task_date <= today)

// features/tasks/lib/taskSelectors.js
selectTasksForDate(tasks, date), filterByStatus(tasks, status), selectOverdue(tasks, today) (BR-09), sortTasks(tasks)
```

`today` is always passed in as a parameter and never read inside the functions, so tests are deterministic. Hooks get it from `todayLocal()` in `lib/dates.js`.
