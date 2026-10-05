-- Allow "salary too high" as a skip reason on user_job_states.
alter table public.user_job_states
    drop constraint if exists user_job_states_skip_reason_check;

alter table public.user_job_states
    add constraint user_job_states_skip_reason_check
        check (skip_reason is null or skip_reason in (
            'salary_too_low', 'salary_too_high', 'too_senior', 'experience_requirement',
            'wrong_location', 'tech_stack', 'education_requirement',
            'employment_type', 'company', 'not_interested', 'other'
        ));
