-- Flowboard Kanban — Full Supabase Schema
-- Run this in the Supabase SQL Editor after creating your project.
-- Also enable Anonymous sign-ins: Authentication → Providers → Anonymous

-- ============================================================
-- TABLES
-- ============================================================

create table if not exists public.team_members (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  color text not null default '#0F766E',
  avatar_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.labels (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  color text not null default '#64748B',
  created_at timestamptz not null default now()
);

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text,
  status text not null default 'todo'
    check (status in ('todo', 'in_progress', 'in_review', 'done')),
  priority text not null default 'normal'
    check (priority in ('low', 'normal', 'high')),
  due_date date,
  assignee_id uuid references public.team_members(id) on delete set null,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.task_labels (
  task_id uuid not null references public.tasks(id) on delete cascade,
  label_id uuid not null references public.labels(id) on delete cascade,
  primary key (task_id, label_id)
);

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.activity_log (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  action text not null,
  detail text,
  created_at timestamptz not null default now()
);

-- ============================================================
-- INDEXES
-- ============================================================

create index if not exists tasks_user_id_idx on public.tasks(user_id);
create index if not exists tasks_status_idx on public.tasks(status);
create index if not exists team_members_user_id_idx on public.team_members(user_id);
create index if not exists labels_user_id_idx on public.labels(user_id);
create index if not exists comments_task_id_idx on public.comments(task_id);
create index if not exists activity_log_task_id_idx on public.activity_log(task_id);

-- ============================================================
-- UPDATED_AT TRIGGER
-- ============================================================

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists tasks_updated_at on public.tasks;
create trigger tasks_updated_at
  before update on public.tasks
  for each row execute function public.set_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table public.tasks enable row level security;
alter table public.team_members enable row level security;
alter table public.labels enable row level security;
alter table public.task_labels enable row level security;
alter table public.comments enable row level security;
alter table public.activity_log enable row level security;

-- Tasks
create policy "Users manage own tasks"
  on public.tasks for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Team members
create policy "Users manage own team members"
  on public.team_members for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Labels
create policy "Users manage own labels"
  on public.labels for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Task labels (via task ownership)
create policy "Users manage own task labels"
  on public.task_labels for all
  using (
    exists (
      select 1 from public.tasks t
      where t.id = task_id and t.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.tasks t
      where t.id = task_id and t.user_id = auth.uid()
    )
  );

-- Comments
create policy "Users manage own comments"
  on public.comments for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Activity log
create policy "Users manage own activity"
  on public.activity_log for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
