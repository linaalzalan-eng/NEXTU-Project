-- 0001_create_tasks.sql — NEXTU tasks table, constraints, trigger, privileges, and RLS.
-- Source: docs/DATABASE_SCHEMA.md. Apply once, in the Supabase SQL Editor (D-17).
-- Running it a second time fails on "already exists"; that is expected.

-- 1. Table ------------------------------------------------------------------
create table public.tasks (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null default auth.uid()
               references auth.users (id) on delete cascade,
  title        text not null,
  status       text not null default 'pending',
  task_date    date not null,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  completed_at timestamptz,
  constraint tasks_title_length check (char_length(btrim(title)) between 1 and 200),
  constraint tasks_status_valid check (status in ('pending', 'completed')),
  constraint tasks_completed_at_consistent
    check ((status = 'completed') = (completed_at is not null))
);

-- 2. Index: tasks of one user by date (every query pattern, and the RLS check)
create index tasks_user_id_task_date_idx on public.tasks (user_id, task_date);

-- 3. Keep updated_at current on every update
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger tasks_set_updated_at
before update on public.tasks
for each row execute function public.set_updated_at();

-- 4. Privileges: which roles may reach the table through the Data API at all.
-- New Supabase projects no longer grant this automatically (D-30).
-- Visitors (anon) get nothing; signed-in users get the four operations,
-- and RLS below decides which rows.
revoke all on table public.tasks from anon;
grant select, insert, update, delete on table public.tasks to authenticated;

-- 5. Row Level Security: each user sees and changes only their own rows
alter table public.tasks enable row level security;

create policy "Users can read own tasks"
  on public.tasks for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can insert own tasks"
  on public.tasks for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update own tasks"
  on public.tasks for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can delete own tasks"
  on public.tasks for delete to authenticated
  using ((select auth.uid()) = user_id);
