-- Per-user salary hard-filter verdict (from job preferences salary_min / salary_max).
alter table public.user_job_states
    add column if not exists salary_status text
        check (salary_status is null or salary_status in ('pass', 'rejected', 'unknown'));

create index if not exists user_job_states_salary_status_idx
    on public.user_job_states (user_id, salary_status);
