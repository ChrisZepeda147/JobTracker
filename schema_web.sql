-- JobTracker web app: user-specific candidate context.
-- Idempotent. Safe to re-run. Does NOT alter existing job/suppression tables.

-- ---------------------------------------------------------------
-- Candidate profile (one row per user)
-- ---------------------------------------------------------------
create table if not exists public.candidate_profiles (
    user_id                    uuid primary key references auth.users (id) on delete cascade,
    full_name                  text not null default '',
    current_title              text not null default '',
    location                   text not null default '',
    software_experience_years  integer,
    education                  text not null default '',
    professional_summary       text not null default '',
    technical_skills           text[] not null default '{}',
    professional_strengths     text[] not null default '{}',
    additional_context         text not null default '',
    created_at                 timestamptz not null default now(),
    updated_at                 timestamptz not null default now()
);

-- ---------------------------------------------------------------
-- Resumes (multiple per user; one active at a time)
-- ---------------------------------------------------------------
create table if not exists public.resumes (
    id           uuid primary key default gen_random_uuid(),
    user_id      uuid not null references auth.users (id) on delete cascade,
    name         text not null,
    target_role  text not null default '',
    resume_text  text not null default '',
    ai_notes     text not null default '',
    is_active    boolean not null default false,
    created_at   timestamptz not null default now(),
    updated_at   timestamptz not null default now()
);

create index if not exists resumes_user_id_idx on public.resumes (user_id);
create index if not exists resumes_user_active_idx on public.resumes (user_id, is_active);

-- ---------------------------------------------------------------
-- Projects
-- ---------------------------------------------------------------
create table if not exists public.projects (
    id                    uuid primary key default gen_random_uuid(),
    user_id               uuid not null references auth.users (id) on delete cascade,
    name                  text not null,
    github_url            text not null default '',
    technologies          text[] not null default '{}',
    readme_text           text not null default '',
    personal_contribution text not null default '',
    ai_notes              text not null default '',
    created_at            timestamptz not null default now(),
    updated_at            timestamptz not null default now()
);

create index if not exists projects_user_id_idx on public.projects (user_id);

-- ---------------------------------------------------------------
-- Job preferences (one row per user)
-- ---------------------------------------------------------------
create table if not exists public.job_preferences (
    user_id                          uuid primary key references auth.users (id) on delete cascade,
    target_roles                     text[] not null default '{}',
    salary_min                       numeric(12,2),
    salary_preferred                 numeric(12,2),
    salary_max                       numeric(12,2),
    max_preferred_experience_years   integer,
    preferred_locations              text[] not null default '{}',
    remote_allowed                   boolean not null default true,
    hybrid_allowed                   boolean not null default true,
    onsite_allowed                   boolean not null default false,
    excluded_seniority               text[] not null default '{}',
    excluded_keywords                text[] not null default '{}',
    additional_instructions          text not null default '',
    created_at                       timestamptz not null default now(),
    updated_at                       timestamptz not null default now()
);

-- ---------------------------------------------------------------
-- updated_at trigger (shared)
-- ---------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
    new.updated_at := now();
    return new;
end;
$$;

drop trigger if exists candidate_profiles_updated_at on public.candidate_profiles;
create trigger candidate_profiles_updated_at
    before update on public.candidate_profiles
    for each row execute function public.set_updated_at();

drop trigger if exists resumes_updated_at on public.resumes;
create trigger resumes_updated_at
    before update on public.resumes
    for each row execute function public.set_updated_at();

drop trigger if exists projects_updated_at on public.projects;
create trigger projects_updated_at
    before update on public.projects
    for each row execute function public.set_updated_at();

drop trigger if exists job_preferences_updated_at on public.job_preferences;
create trigger job_preferences_updated_at
    before update on public.job_preferences
    for each row execute function public.set_updated_at();

-- Only one active resume per user
create or replace function public.ensure_single_active_resume()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
    if new.is_active then
        update public.resumes
           set is_active = false
         where user_id = new.user_id
           and id <> new.id
           and is_active = true;
    end if;
    return new;
end;
$$;

drop trigger if exists resumes_single_active_trg on public.resumes;
create trigger resumes_single_active_trg
    before insert or update of is_active on public.resumes
    for each row execute function public.ensure_single_active_resume();

-- ---------------------------------------------------------------
-- Row level security
-- ---------------------------------------------------------------
alter table public.candidate_profiles enable row level security;
alter table public.resumes           enable row level security;
alter table public.projects          enable row level security;
alter table public.job_preferences   enable row level security;

-- candidate_profiles
drop policy if exists "users select own profile" on public.candidate_profiles;
create policy "users select own profile"
    on public.candidate_profiles for select to authenticated
    using (auth.uid() = user_id);

drop policy if exists "users insert own profile" on public.candidate_profiles;
create policy "users insert own profile"
    on public.candidate_profiles for insert to authenticated
    with check (auth.uid() = user_id);

drop policy if exists "users update own profile" on public.candidate_profiles;
create policy "users update own profile"
    on public.candidate_profiles for update to authenticated
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

drop policy if exists "users delete own profile" on public.candidate_profiles;
create policy "users delete own profile"
    on public.candidate_profiles for delete to authenticated
    using (auth.uid() = user_id);

-- resumes
drop policy if exists "users select own resumes" on public.resumes;
create policy "users select own resumes"
    on public.resumes for select to authenticated
    using (auth.uid() = user_id);

drop policy if exists "users insert own resumes" on public.resumes;
create policy "users insert own resumes"
    on public.resumes for insert to authenticated
    with check (auth.uid() = user_id);

drop policy if exists "users update own resumes" on public.resumes;
create policy "users update own resumes"
    on public.resumes for update to authenticated
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

drop policy if exists "users delete own resumes" on public.resumes;
create policy "users delete own resumes"
    on public.resumes for delete to authenticated
    using (auth.uid() = user_id);

-- projects
drop policy if exists "users select own projects" on public.projects;
create policy "users select own projects"
    on public.projects for select to authenticated
    using (auth.uid() = user_id);

drop policy if exists "users insert own projects" on public.projects;
create policy "users insert own projects"
    on public.projects for insert to authenticated
    with check (auth.uid() = user_id);

drop policy if exists "users update own projects" on public.projects;
create policy "users update own projects"
    on public.projects for update to authenticated
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

drop policy if exists "users delete own projects" on public.projects;
create policy "users delete own projects"
    on public.projects for delete to authenticated
    using (auth.uid() = user_id);

-- job_preferences
drop policy if exists "users select own preferences" on public.job_preferences;
create policy "users select own preferences"
    on public.job_preferences for select to authenticated
    using (auth.uid() = user_id);

drop policy if exists "users insert own preferences" on public.job_preferences;
create policy "users insert own preferences"
    on public.job_preferences for insert to authenticated
    with check (auth.uid() = user_id);

drop policy if exists "users update own preferences" on public.job_preferences;
create policy "users update own preferences"
    on public.job_preferences for update to authenticated
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

drop policy if exists "users delete own preferences" on public.job_preferences;
create policy "users delete own preferences"
    on public.job_preferences for delete to authenticated
    using (auth.uid() = user_id);
