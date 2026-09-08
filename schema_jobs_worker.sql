-- Add per-source result tracking to job search requests.
alter table public.job_search_requests
    add column if not exists source_results jsonb not null default '{}'::jsonb;

-- Worker uses service_role key (bypasses RLS). No frontend changes needed.
