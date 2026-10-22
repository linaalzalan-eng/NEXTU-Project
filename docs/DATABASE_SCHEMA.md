# Database Schema

Platform: Supabase (PostgreSQL). Applied in Phase 5 from `supabase/migrations/` (D-17).
One application table (D-04). Users are managed by Supabase Auth in `auth.users`, which we do not modify.

## 1. Entity Relationship

```mermaid
erDiagram
    AUTH_USERS ||--o{ TASKS : owns
    AUTH_USERS {
        uuid id PK
        text email
    }
    TASKS {
        uuid id PK
        uuid user_id FK
        text title
        text status
        date task_date
        timestamptz created_at
        timestamptz updated_at
        timestamptz completed_at
    }
```

## 2. Table `public.tasks`

- **`id`** (`uuid`, required, default `gen_random_uuid()`): primary key.
- **`user_id`** (`uuid`, required, default `auth.uid()`): owner. Foreign key to `auth.users(id)` `ON DELETE CASCADE`.
- **`title`** (`text`, required): trimmed length 1–200 (VR-03).
- **`status`** (`text`, required, default `'pending'`): either `'pending'` or `'completed'` (D-06).
- **`task_date`** (`date`, required): the calendar day the task belongs to (BR-10). There is no time-zone conversion.
- **`created_at`** (`timestamptz`, required, default `now()`).
- **`updated_at`** (`timestamptz`, required, default `now()`): maintained by a trigger.
- **`completed_at`** (`timestamptz`, optional): set if and only if `status = 'completed'` (BR-12).

### Constraints
- `tasks_title_length`: `char_length(btrim(title)) BETWEEN 1 AND 200`.
- `tasks_status_valid`: `status IN ('pending', 'completed')`.
- `tasks_completed_at_consistent`: `(status = 'completed') = (completed_at IS NOT NULL)`.
- The `task_date` range (BR-14) is validated on the client only. "Today" depends on the user's time zone, which the database does not know (BR-10).

### Indexes
- `tasks_user_id_task_date_idx` on `(user_id, task_date)`. It serves every query pattern: tasks for a date, a date range, overdue tasks, and the full history ordered by date. It also speeds up RLS checks on `user_id`.

## 3. Privileges and Row Level Security

Two layers decide what a request may do:
1. **Table privileges (`grant`)** decide whether a role may reach the table through the Data API at all. Supabase no longer grants them automatically on new tables (D-30), so the migration grants `select, insert, update, delete` to `authenticated` and revokes everything from `anon`.
2. **RLS policies** decide which rows a permitted role sees and changes.

RLS is **enabled**, and each operation has its own policy for the `authenticated` role. The `anon` role has no policy and therefore no access.
`(select auth.uid())` is used instead of `auth.uid()` because Supabase recommends this form for better performance (the value is computed once per query).

- **select:** `USING ((select auth.uid()) = user_id)`.
- **insert:** `WITH CHECK ((select auth.uid()) = user_id)`.
- **update:** `USING ((select auth.uid()) = user_id)` and `WITH CHECK ((select auth.uid()) = user_id)`. The user cannot move a task to another owner.
- **delete:** `USING ((select auth.uid()) = user_id)`.

## 4. Migration `0001_create_tasks.sql`

The SQL lives in one place: `supabase/migrations/0001_create_tasks.sql` (P5-T02). It creates, in order:
1. The table and its three constraints (§2).
2. The index `tasks_user_id_task_date_idx`.
3. The function `set_updated_at()` (with `set search_path = ''`) and the trigger `tasks_set_updated_at`.
4. The privileges (§3): `revoke all ... from anon`, `grant select, insert, update, delete ... to authenticated`.
5. RLS enabled, and the four policies (§3).

It is **apply once** (plain `create` statements). It was reviewed against the current Supabase documentation on 2026-10-17; the privileges block was added then (D-30).

## 5. Migration Strategy

- Each schema change is a new numbered file (`0002_...sql`). Applied migrations are never edited.
- Each migration file is idempotent where practical, or documented as "apply once".
- Migrations are applied in order through the Supabase SQL Editor, and each one is recorded in `PROGRESS.md` with its date.
- Before applying a migration to production, test it on a separate development project, or at least run the security tests (`TESTING_PLAN.md`, ST-xx) after applying it.
- Destructive changes (dropping columns or tables) require owner approval and a backup export first.

## 6. Not Included (by design)

- No `profiles` table (D-04).
- No statistics or snapshot tables (BR-11, D-09).
- No `deleted_at` column (D-12).
