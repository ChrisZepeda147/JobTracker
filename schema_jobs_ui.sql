-- JobTracker Jobs UI: search requests and per-user job state.
-- Idempotent. Does NOT alter existing job/suppression pipeline behavior.

-- Optional display field for the Jobs UI (populated by scraper later).
alter table public.jobs
    add column if not exists experience_requirement text;

-- ---------------------------------------------------------------
-- Job search requests (queued by the web app; processed by Python later)
-- ---------------------------------------------------------------
create table if not exists public.job_search_requests (
    id                 uuid primary key default gen_random_uuid(),
    user_id            uuid not null references auth.users (id) on delete cascade,
    query              text not null default '',
    location           text not null default '',
    salary_min         numeric(12,2),
    salary_max         numeric(12,2),
    posted_within_days integer,
    remote_allowed     boolean not null default true,
    hybrid_allowed     boolean not null default true,
    onsite_allowed     boolean not null default false,
    sources            text[] not null default '{}',
    status             text not null default 'pending'
                       check (status in ('pending', 'running', 'completed', 'failed')),
    jobs_found         integer not null default 0,
    new_jobs_found     integer not null default 0,
    error              text,
    created_at         timestamptz not null default now(),
    started_at         timestamptz,
    completed_at       timestamptz
);

create index if not exists job_search_requests_user_idx
    on public.job_search_requests (user_id, created_at desc);

-- ---------------------------------------------------------------
-- Per-user job interaction state (canonical jobs stay global)
-- ---------------------------------------------------------------
create table if not exists public.user_job_states (
    user_id           uuid not null references auth.users (id) on delete cascade,
    job_id            uuid not null references public.jobs (id) on delete cascade,
    status            text not null default 'new'
                      check (status in (
                          'new', 'recommended', 'apply_later', 'opened',
                          'applied', 'skipped', 'interview', 'rejected', 'offer'
                      )),
    apply_clicked_at  timestamptz,
    applied_at        timestamptz,
    skip_reason       text
                      check (skip_reason is null or skip_reason in (
                          'salary_too_low', 'salary_too_high', 'too_senior', 'experience_requirement',
                          'wrong_location', 'tech_stack', 'education_requirement',
                          'employment_type', 'company', 'not_interested', 'other'
                      )),
    user_notes        text not null default '',
    created_at        timestamptz not null default now(),
    updated_at        timestamptz not null default now(),
    primary key (user_id, job_id)
);

create index if not exists user_job_states_user_status_idx
    on public.user_job_states (user_id, status);

create index if not exists user_job_states_job_idx
    on public.user_job_states (job_id);

-- updated_at trigger
drop trigger if exists user_job_states_updated_at on public.user_job_states;
create trigger user_job_states_updated_at
    before update on public.user_job_states
    for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------
-- Row level security
-- ---------------------------------------------------------------
alter table public.job_search_requests enable row level security;
alter table public.user_job_states       enable row level security;

-- job_search_requests
drop policy if exists "users select own search requests" on public.job_search_requests;
create policy "users select own search requests"
    on public.job_search_requests for select to authenticated
    using (auth.uid() = user_id);

drop policy if exists "users insert own search requests" on public.job_search_requests;
create policy "users insert own search requests"
    on public.job_search_requests for insert to authenticated
    with check (auth.uid() = user_id);

drop policy if exists "users update own search requests" on public.job_search_requests;
create policy "users update own search requests"
    on public.job_search_requests for update to authenticated
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

-- user_job_states
drop policy if exists "users select own job states" on public.user_job_states;
create policy "users select own job states"
    on public.user_job_states for select to authenticated
    using (auth.uid() = user_id);

drop policy if exists "users insert own job states" on public.user_job_states;
create policy "users insert own job states"
    on public.user_job_states for insert to authenticated
    with check (auth.uid() = user_id);

drop policy if exists "users update own job states" on public.user_job_states;
create policy "users update own job states"
    on public.user_job_states for update to authenticated
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

drop policy if exists "users delete own job states" on public.user_job_states;
create policy "users delete own job states"
    on public.user_job_states for delete to authenticated
    using (auth.uid() = user_id);

-- Allow authenticated users to read global job listings (may already exist).
drop policy if exists "authenticated read jobs" on public.jobs;
create policy "authenticated read jobs"
    on public.jobs for select to authenticated using (true);
