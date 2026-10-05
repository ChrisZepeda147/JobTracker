-- Per-user education hard-filter verdict (CS degree required).
alter table public.user_job_states
    add column if not exists education_status text
        check (education_status is null or education_status in ('pass', 'rejected'));

create index if not exists user_job_states_education_status_idx
    on public.user_job_states (user_id, education_status);
