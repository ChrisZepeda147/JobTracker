-- Rescore-only requests: re-run local scoring on stored jobs without scraping.
alter table public.job_search_requests
    add column if not exists rescore_only boolean not null default false;

create index if not exists job_search_requests_rescore_pending_idx
    on public.job_search_requests (status, rescore_only, created_at)
    where status = 'pending';
