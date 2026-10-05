-- Location hard-filter: home zip + commute radius in preferences; per-user location verdict on job states.
alter table public.job_preferences
    add column if not exists home_zip text,
    add column if not exists max_commute_miles integer
        check (max_commute_miles is null or max_commute_miles between 1 and 100);

alter table public.user_job_states
    add column if not exists commute_miles numeric(8,1),
    add column if not exists work_arrangement text
        check (work_arrangement is null or work_arrangement in ('remote', 'hybrid', 'onsite', 'unknown')),
    add column if not exists location_status text
        check (location_status is null or location_status in ('pass', 'rejected', 'unverified'));

create index if not exists user_job_states_location_status_idx
    on public.user_job_states (user_id, location_status);
