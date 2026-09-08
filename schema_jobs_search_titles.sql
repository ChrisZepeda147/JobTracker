-- Multi-title job searches (up to 5 titles per request).
alter table public.job_search_requests
    add column if not exists titles text[] not null default '{}';

-- Backfill legacy single-query rows.
update public.job_search_requests
set titles = array[query]
where (titles is null or titles = '{}')
  and coalesce(trim(query), '') <> '';
