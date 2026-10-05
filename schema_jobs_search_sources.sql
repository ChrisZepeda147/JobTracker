-- Per-user job board selection for queued searches.
alter table public.job_preferences
    add column if not exists search_sources text[] not null default '{linkedin,indeed,builtin}';
