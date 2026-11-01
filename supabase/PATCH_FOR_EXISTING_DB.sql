-- ============================================================================
-- FitCalc: PATCH FOR EXISTING DATABASE (Migrations 005 & 006)
-- ============================================================================
-- WHEN TO USE THIS FILE:
-- Use this script in the Supabase SQL Editor IF you have already executed migrations
-- 001 through 004 on your database. It applies:
-- - 005_delete_account.sql: Secure self-serve account deletion RPC
-- - 006_idempotency.sql: Duplicate cleaning, unique indexes, and guarded constraints
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
