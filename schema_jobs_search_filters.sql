-- Search filter fields: zip anchor + max onsite commute radius.
alter table public.job_search_requests
    add column if not exists location_zip text,
    add column if not exists max_onsite_miles integer
        check (max_onsite_miles is null or max_onsite_miles between 1 and 100);
