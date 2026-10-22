-- Strict filtering: preferences flag + per-user listing/management filter state.

alter table public.job_preferences
    add column if not exists strict_filtering boolean not null default true;

alter table public.user_job_states
    add column if not exists management_status text
        check (management_status is null or management_status in ('pass', 'rejected')),
    add column if not exists seniority_status text
        check (seniority_status is null or seniority_status in ('pass', 'rejected')),
    add column if not exists listing_status text
        check (listing_status is null or listing_status in ('open', 'closed', 'unknown')),
    add column if not exists listing_checked_at timestamptz,
    add column if not exists listing_check_reason text,
    add column if not exists filter_reason text;

create index if not exists user_job_states_listing_status_idx
    on public.user_job_states (user_id, listing_status);
