-- Stretch flag for borderline matches; nationwide remote scraper scope per search.
alter table public.user_job_states
    add column if not exists is_stretch boolean not null default false;

alter table public.job_search_requests
    add column if not exists nationwide_remote boolean not null default false;
