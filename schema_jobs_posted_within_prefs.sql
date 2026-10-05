-- Default freshness for searches and Jobs board hiding.
alter table public.job_preferences
    add column if not exists posted_within_days integer not null default 21
        check (posted_within_days > 0 and posted_within_days <= 90);
