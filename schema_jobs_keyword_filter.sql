-- Per-user excluded-keyword hard-filter verdict.
alter table public.user_job_states
    add column if not exists keyword_status text
        check (keyword_status is null or keyword_status in ('pass', 'rejected'));

create index if not exists user_job_states_keyword_status_idx
    on public.user_job_states (user_id, keyword_status);
