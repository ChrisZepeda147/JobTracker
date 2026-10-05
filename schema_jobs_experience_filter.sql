-- Per-user experience hard-filter verdict (from max_preferred_experience_years).
alter table public.user_job_states
    add column if not exists experience_status text
        check (experience_status is null or experience_status in ('pass', 'rejected', 'unknown'));

create index if not exists user_job_states_experience_status_idx
    on public.user_job_states (user_id, experience_status);
