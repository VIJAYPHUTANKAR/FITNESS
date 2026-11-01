-- ============================================================================
-- FitCalc: PATCH FOR EXISTING DATABASE (Migrations 005, 006, 007, 008)
-- ============================================================================
-- WHEN TO USE THIS FILE:
-- Use this script in the Supabase SQL Editor IF you have already executed migrations
-- 001 through 004 on your database. It applies:
-- - 005_delete_account.sql: Secure self-serve account deletion RPC
-- - 006_idempotency.sql: Duplicate cleaning, unique indexes, and guarded constraints
-- - 007_food_fk_cascade_policies.sql: ON DELETE SET NULL FKs and cross-tenant food log checks
-- - 008_calorie_floor_and_minors.sql: Calorie goal floor and minor age checks
-- ============================================================================

-- ── 005_delete_account.sql ───────────────────────────────────────────────────

create or replace function public.delete_my_account()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid;
begin
  v_user_id := auth.uid();
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  delete from auth.users where id = v_user_id;
end;
$$;

revoke all on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;

-- ── 006_idempotency.sql ──────────────────────────────────────────────────────

do $$
begin
  -- Repoint any food_logs referencing duplicate global foods to the lowest ID
  with duplicates as (
    select id,
           min(id) over (partition by lower(name)) as canonical_id
    from public.foods
    where user_id is null
  )
  update public.food_logs fl
  set food_id = d.canonical_id
  from duplicates d
  where fl.food_id = d.id
    and d.id <> d.canonical_id;

  -- Delete duplicate global food rows
  with duplicates as (
    select id,
           min(id) over (partition by lower(name)) as canonical_id
    from public.foods
    where user_id is null
  )
  delete from public.foods
  where id in (
    select id from duplicates where id <> canonical_id
  );
end $$;

-- Partial unique index on global foods
create unique index if not exists foods_global_name_uniq
  on public.foods (lower(name))
  where user_id is null;

-- Guarded unique constraint on exercises
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.exercises'::regclass
      and contype = 'u'
  ) then
    alter table public.exercises add constraint exercises_name_uniq unique (name);
  end if;
end $$;

-- Idempotent check constraints
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'profiles_weight_kg_check') then
    alter table public.profiles add constraint profiles_weight_kg_check
      check (weight_kg is null or (weight_kg >= 20.0 and weight_kg <= 500.0));
  end if;

  if not exists (select 1 from pg_constraint where conname = 'profiles_height_cm_check') then
    alter table public.profiles add constraint profiles_height_cm_check
      check (height_cm is null or (height_cm >= 50.0 and height_cm <= 260.0));
  end if;

  if not exists (select 1 from pg_constraint where conname = 'profiles_daily_calorie_goal_check') then
    alter table public.profiles add constraint profiles_daily_calorie_goal_check
      check (daily_calorie_goal is null or (daily_calorie_goal >= 500 and daily_calorie_goal <= 10000));
  end if;

  if not exists (select 1 from pg_constraint where conname = 'foods_calories_per_100g_check') then
    alter table public.foods add constraint foods_calories_per_100g_check
      check (calories_per_100g >= 0 and calories_per_100g <= 1000);
  end if;

  if not exists (select 1 from pg_constraint where conname = 'foods_serving_grams_check') then
    alter table public.foods add constraint foods_serving_grams_check
      check (serving_grams is null or (serving_grams > 0 and serving_grams <= 5000));
  end if;

  if not exists (select 1 from pg_constraint where conname = 'foods_macros_check') then
    alter table public.foods add constraint foods_macros_check
      check (
        (protein_g is null or (protein_g >= 0 and protein_g <= 100)) and
        (carbs_g is null or (carbs_g >= 0 and carbs_g <= 100)) and
        (fat_g is null or (fat_g >= 0 and fat_g <= 100)) and
        (fiber_g is null or (fiber_g >= 0 and fiber_g <= 100))
      );
  end if;

  if not exists (select 1 from pg_constraint where conname = 'food_logs_quantity_grams_check') then
    alter table public.food_logs add constraint food_logs_quantity_grams_check
      check (quantity_grams > 0 and quantity_grams <= 5000);
  end if;

  if not exists (select 1 from pg_constraint where conname = 'food_logs_calories_check') then
    alter table public.food_logs add constraint food_logs_calories_check
      check (calories >= 0 and calories <= 20000);
  end if;

  if not exists (select 1 from pg_constraint where conname = 'food_logs_macros_check') then
    alter table public.food_logs add constraint food_logs_macros_check
      check (
        (protein_g is null or protein_g >= 0) and
        (carbs_g is null or carbs_g >= 0) and
        (fat_g is null or fat_g >= 0)
      );
  end if;

  if not exists (select 1 from pg_constraint where conname = 'exercises_met_check') then
    alter table public.exercises add constraint exercises_met_check
      check (met > 0 and met <= 30.0);
  end if;

  if not exists (select 1 from pg_constraint where conname = 'exercise_logs_duration_min_check') then
    alter table public.exercise_logs add constraint exercise_logs_duration_min_check
      check (duration_min > 0 and duration_min <= 600);
  end if;

  if not exists (select 1 from pg_constraint where conname = 'exercise_logs_calories_burned_check') then
    alter table public.exercise_logs add constraint exercise_logs_calories_burned_check
      check (calories_burned >= 0 and calories_burned <= 15000);
  end if;

  if not exists (select 1 from pg_constraint where conname = 'weight_logs_weight_kg_check') then
    alter table public.weight_logs add constraint weight_logs_weight_kg_check
      check (weight_kg >= 20.0 and weight_kg <= 500.0);
  end if;

  if not exists (select 1 from pg_constraint where conname = 'burn_plans_calories_check') then
    alter table public.burn_plans add constraint burn_plans_calories_check
      check (calories_to_burn > 0 and calories_to_burn <= 50000);
  end if;

  if not exists (select 1 from pg_constraint where conname = 'burn_plans_days_check') then
    alter table public.burn_plans add constraint burn_plans_days_check
      check (days >= 1 and days <= 90);
  end if;
end $$;

-- ── 007_food_fk_cascade_policies.sql ─────────────────────────────────────────

-- 1. Alter food_logs.food_id FK to ON DELETE SET NULL
alter table if exists public.food_logs
  drop constraint if exists food_logs_food_id_fkey;

alter table public.food_logs
  add constraint food_logs_food_id_fkey
  foreign key (food_id) references public.foods(id) on delete set null;

-- 2. Alter exercise_logs.exercise_id FK to ON DELETE SET NULL
alter table if exists public.exercise_logs
  drop constraint if exists exercise_logs_exercise_id_fkey;

alter table public.exercise_logs
  add constraint exercise_logs_exercise_id_fkey
  foreign key (exercise_id) references public.exercises(id) on delete set null;

-- 3. Update food_logs RLS policy to enforce referenced foods exist and are visible
drop policy if exists "own food logs" on public.food_logs;
create policy "own food logs" on public.food_logs
  for all
  using (auth.uid() = user_id)
  with check (
    auth.uid() = user_id and
    (food_id is null or exists (select 1 from public.foods f where f.id = food_id))
  );

-- 4. Update exercise_logs RLS policy similarly
drop policy if exists "own exercise logs" on public.exercise_logs;
create policy "own exercise logs" on public.exercise_logs
  for all
  using (auth.uid() = user_id)
  with check (
    auth.uid() = user_id and
    (exercise_id is null or exists (select 1 from public.exercises e where e.id = exercise_id))
  );

-- ── 008_calorie_floor_and_minors.sql ─────────────────────────────────────────

-- 1. Check constraint on daily_calorie_goal floor (1200 female / 1500 male and other)
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


-- ── 009_replace_log_policies.sql ─────────────────────────────────────────────

begin;

-- Drop every existing policy on public.food_logs and public.exercise_logs
do $$
declare
  r record;
begin
  for r in (
    select schemaname, tablename, policyname
    from pg_policies
    where schemaname = 'public'
      and tablename in ('food_logs', 'exercise_logs')
  ) loop
    execute format('drop policy if exists %I on %I.%I', r.policyname, r.schemaname, r.tablename);
  end loop;
end $$;

-- Single unified policy for public.food_logs
create policy "food_logs_authenticated_owner" on public.food_logs
  for all
  to authenticated
  using (auth.uid() = user_id)
  with check (
    auth.uid() = user_id and
    (food_id is null or exists (select 1 from public.foods f where f.id = food_id))
  );

-- Single unified policy for public.exercise_logs
create policy "exercise_logs_authenticated_owner" on public.exercise_logs
  for all
  to authenticated
  using (auth.uid() = user_id)
  with check (
    auth.uid() = user_id and
    (exercise_id is null or exists (select 1 from public.exercises e where e.id = exercise_id))
  );

-- Ensure RLS is enabled on both tables
alter table public.food_logs enable row level security;
alter table public.exercise_logs enable row level security;

commit;
