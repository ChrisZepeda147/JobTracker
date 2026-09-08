-- JobTracker schema: deduplicated job storage, suppression lists, match scores.
-- Idempotent: safe to re-run. Apply in the Supabase SQL editor.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------
-- Suppression lists
-- ---------------------------------------------------------------

-- Individual postings you never want to see again. Either key blocks a job:
-- job_hash (company+title+location) or url_hash (canonical URL).
create table if not exists public.suppressed_jobs (
    job_hash    text primary key,
    url_hash    text,
    reason      text not null default 'manual',
    created_at  timestamptz not null default now()
);
create index if not exists suppressed_jobs_url_hash_idx on public.suppressed_jobs (url_hash);

-- Whole companies to block (staffing agencies, previous employers, etc).
create table if not exists public.suppressed_companies (
    company_key text primary key,          -- lower(btrim(company))
    label       text,                      -- original casing, for display
    reason      text not null default 'manual',
    created_at  timestamptz not null default now()
);

-- Substring rules applied to title and/or description.
create table if not exists public.suppressed_keywords (
    id          bigserial primary key,
    pattern     text not null,
    applies_to  text not null default 'title'
                check (applies_to in ('title', 'description', 'both')),
    reason      text not null default 'manual',
    created_at  timestamptz not null default now(),
    unique (pattern, applies_to)
);

-- Explicit feedback. Both lists suppress the posting from future runs: a liked
-- job is already in your pipeline, and a disliked job was already rejected.
create table if not exists public.liked_jobs (
    job_hash    text primary key,
    url_hash    text,
    company     text,
    title       text,
    note        text,
    created_at  timestamptz not null default now()
);
create index if not exists liked_jobs_url_hash_idx on public.liked_jobs (url_hash);

create table if not exists public.disliked_jobs (
    job_hash    text primary key,
    url_hash    text,
    company     text,
    title       text,
    reason      text,
    created_at  timestamptz not null default now()
);
create index if not exists disliked_jobs_url_hash_idx on public.disliked_jobs (url_hash);

-- ---------------------------------------------------------------
-- Jobs
-- ---------------------------------------------------------------
create table if not exists public.jobs (
    id             uuid primary key default gen_random_uuid(),
    job_hash       text not null unique,   -- MD5(company|title|location)
    url_hash       text,                   -- MD5(canonical url)
    title          text not null,
    company        text not null default '',
    company_key    text generated always as (lower(btrim(company))) stored,
    location       text not null default '',
    job_url        text not null,
    description    text not null default '',
    site           text not null,
    salary_min     numeric(12,2),
    salary_max     numeric(12,2),
    posted_date    date,
    status         text not null default 'new'
                   check (status in ('new','seen','applied','rejected','archived')),
    match_score    integer check (match_score between 0 and 100),
    fit_reason     text,
    missing_skills text[],
    scored_by      text,                   -- which provider produced the score
    scored_at      timestamptz,
    times_seen     integer not null default 1,
    first_seen_at  timestamptz not null default now(),
    last_seen_at   timestamptz not null default now()
);

-- Second dedup layer: the normalizer strips tracking params, so the same
-- posting reaching us from two boards collapses onto one canonical URL.
create unique index if not exists jobs_job_url_uniq on public.jobs (job_url);

create index if not exists jobs_company_key_idx on public.jobs (company_key);
create index if not exists jobs_site_idx         on public.jobs (site);
create index if not exists jobs_status_idx       on public.jobs (status);
create index if not exists jobs_url_hash_idx     on public.jobs (url_hash);
create index if not exists jobs_match_score_idx  on public.jobs (match_score desc nulls last);
create index if not exists jobs_posted_date_idx  on public.jobs (posted_date desc nulls last);

-- ---------------------------------------------------------------
-- Server-side suppression check (defense in depth)
-- ---------------------------------------------------------------
drop function if exists public.is_job_suppressed(text, text, text, text);

create or replace function public.is_job_suppressed(
    p_job_hash    text,
    p_company     text,
    p_title       text,
    p_description text default '',
    p_url_hash    text default ''
) returns boolean
language sql
stable
set search_path = public, pg_temp
as $$
    select
        exists (select 1 from public.suppressed_jobs s
                where s.job_hash = p_job_hash
                   or (coalesce(p_url_hash, '') <> '' and s.url_hash = p_url_hash))
     or exists (select 1 from public.liked_jobs l
                where l.job_hash = p_job_hash
                   or (coalesce(p_url_hash, '') <> '' and l.url_hash = p_url_hash))
     or exists (select 1 from public.disliked_jobs d
                where d.job_hash = p_job_hash
                   or (coalesce(p_url_hash, '') <> '' and d.url_hash = p_url_hash))
     or exists (select 1 from public.suppressed_companies c
                where c.company_key = lower(btrim(p_company)))
     or exists (select 1 from public.suppressed_keywords k
                where (k.applies_to in ('title','both')
                       and lower(p_title) like '%' || lower(k.pattern) || '%')
                   or (k.applies_to in ('description','both')
                       and lower(p_description) like '%' || lower(k.pattern) || '%'));
$$;

-- Silently drop suppressed rows on insert. Returning NULL from a BEFORE
-- INSERT trigger skips the row without aborting the surrounding batch,
-- so one blocked posting cannot fail an entire upsert.
create or replace function public.jobs_block_suppressed()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
    if public.is_job_suppressed(new.job_hash, new.company, new.title, new.description, new.url_hash) then
        return null;
    end if;
    return new;
end;
$$;

drop trigger if exists jobs_block_suppressed_trg on public.jobs;
create trigger jobs_block_suppressed_trg
    before insert on public.jobs
    for each row execute function public.jobs_block_suppressed();

-- Track re-sightings, and never let a re-scrape erase a status or a score.
create or replace function public.jobs_touch_last_seen()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
    new.last_seen_at   := now();
    new.times_seen     := old.times_seen + 1;
    new.first_seen_at  := old.first_seen_at;
    new.status         := old.status;
    new.match_score    := coalesce(new.match_score, old.match_score);
    new.fit_reason     := coalesce(new.fit_reason, old.fit_reason);
    new.missing_skills := coalesce(new.missing_skills, old.missing_skills);
    new.scored_by      := coalesce(new.scored_by, old.scored_by);
    new.scored_at      := coalesce(new.scored_at, old.scored_at);
    return new;
end;
$$;

drop trigger if exists jobs_touch_last_seen_trg on public.jobs;
create trigger jobs_touch_last_seen_trg
    before update on public.jobs
    for each row execute function public.jobs_touch_last_seen();

-- ---------------------------------------------------------------
-- Row level security.
-- The secret (service_role) key used by the pipeline bypasses these
-- policies; the publishable key is read-only against them.
-- ---------------------------------------------------------------
alter table public.jobs                 enable row level security;
alter table public.suppressed_jobs      enable row level security;
alter table public.suppressed_companies enable row level security;
alter table public.suppressed_keywords  enable row level security;
alter table public.liked_jobs           enable row level security;
alter table public.disliked_jobs        enable row level security;

drop policy if exists "authenticated read jobs" on public.jobs;
create policy "authenticated read jobs"
    on public.jobs for select to authenticated using (true);

drop policy if exists "authenticated read suppressed_jobs" on public.suppressed_jobs;
create policy "authenticated read suppressed_jobs"
    on public.suppressed_jobs for select to authenticated using (true);

drop policy if exists "authenticated read suppressed_companies" on public.suppressed_companies;
create policy "authenticated read suppressed_companies"
    on public.suppressed_companies for select to authenticated using (true);

drop policy if exists "authenticated read suppressed_keywords" on public.suppressed_keywords;
create policy "authenticated read suppressed_keywords"
    on public.suppressed_keywords for select to authenticated using (true);

drop policy if exists "authenticated read liked_jobs" on public.liked_jobs;
create policy "authenticated read liked_jobs"
    on public.liked_jobs for select to authenticated using (true);

drop policy if exists "authenticated read disliked_jobs" on public.disliked_jobs;
create policy "authenticated read disliked_jobs"
    on public.disliked_jobs for select to authenticated using (true);

-- ---------------------------------------------------------------
-- Jobs UI (search requests + per-user state)
-- See schema_jobs_ui.sql for job_search_requests and user_job_states.
-- ---------------------------------------------------------------
