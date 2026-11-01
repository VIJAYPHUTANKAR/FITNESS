-- Migration 010: Harden enforce_profile_adult_age Function and Trigger
-- 1. Sets search_path = '' to prevent search-path hijacking attacks in SECURITY DEFINER context.
-- 2. Fully qualifies pg_catalog functions (pg_catalog.current_date, pg_catalog.age, pg_catalog.interval).
-- 3. Compares pg_catalog.age(...) < interval '18 years' to avoid integer truncation quirks.
-- 4. Restricts trigger execution to INSERT or UPDATE OF date_of_birth WHEN (new.date_of_birth IS NOT NULL).
--
-- NOTE: This mechanism serves as a self-declared age gate based on user input,
-- not an identity verification or proof-of-age service.

create or replace function public.enforce_profile_adult_age()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.date_of_birth is not null and pg_catalog.age(pg_catalog.current_date, new.date_of_birth) < pg_catalog.interval '18 years' then
    raise exception 'FitCalc is designed for adults (18+) only. Date of birth must reflect age 18 or older.';
  end if;
  return new;
end;
$$;

drop trigger if exists enforce_profile_adult_age_trigger on public.profiles;
create trigger enforce_profile_adult_age_trigger
  before insert or update of date_of_birth on public.profiles
  for each row
  when (new.date_of_birth is not null)
  execute function public.enforce_profile_adult_age();
