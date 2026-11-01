-- Migration 008: Calorie Floor and Minor Protection
-- Enforces minimum safe calorie goals and restricts onboarding to adults (18+).

-- 1. Check constraint on daily_calorie_goal floor based on biological sex
-- 1,200 kcal for women; 1,500 kcal for men and other/unspecified
alter table if exists public.profiles
  drop constraint if exists check_calorie_goal_floor;

alter table public.profiles
  add constraint check_calorie_goal_floor check (
    daily_calorie_goal is null or (
      case
        when gender = 'female' then daily_calorie_goal >= 1200
        else daily_calorie_goal >= 1500
      end
    )
  );

-- 2. Trigger function to enforce age >= 18 on date_of_birth
-- (PostgreSQL check constraints cannot contain non-immutable functions like current_date;
-- a BEFORE trigger cleanly guarantees database-level adult age enforcement)
create or replace function public.enforce_profile_adult_age()
returns trigger language plpgsql as $$
begin
  if new.date_of_birth is not null and new.date_of_birth > (current_date - interval '18 years') then
    raise exception 'FitCalc is designed for adults (18+) only. Date of birth must reflect age 18 or older.';
  end if;
  return new;
end;
$$;

drop trigger if exists enforce_profile_adult_age_trigger on public.profiles;
create trigger enforce_profile_adult_age_trigger
  before insert or update of date_of_birth on public.profiles
  for each row
  execute function public.enforce_profile_adult_age();

