-- Refilter-only requests: re-run location hard filter on stored jobs without scrape or rescore.
alter table public.job_search_requests
    add column if not exists refilter_only boolean not null default false;

create index if not exists job_search_requests_refilter_pending_idx
    on public.job_search_requests (status, refilter_only, created_at)
    where status = 'pending';
