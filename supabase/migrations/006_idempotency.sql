-- ============================================================================
-- 006_idempotency.sql: Deduplication, Unique Indexes, and Idempotent Constraints
-- ============================================================================
-- Use this migration to harden database idempotency:
-- 1. Cleans up any duplicate global foods, repointing food_logs to the primary ID.
-- 2. Adds partial unique index on global food names: foods_global_name_uniq.
-- 3. Ensures exercises.name has a unique constraint.
-- 4. Checks pg_constraint for all data validation checks before adding.

-- ── 1. Clean up duplicate global foods & preserve food_logs ──────────────────
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

  -- Delete the duplicate global food rows
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

-- ── 2. Unique index on global foods (lower(name) where user_id is null) ──────
create unique index if not exists foods_global_name_uniq
  on public.foods (lower(name))
  where user_id is null;

-- ── 3. Guarded unique constraint on exercises (name) ─────────────────────────
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

-- ── 4. Idempotent check constraints via pg_constraint introspection ──────────
do $$
begin
  -- profiles
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

  -- foods
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

  -- food_logs
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

  -- exercises
  if not exists (select 1 from pg_constraint where conname = 'exercises_met_check') then
    alter table public.exercises add constraint exercises_met_check
      check (met > 0 and met <= 30.0);
  end if;

  -- exercise_logs
  if not exists (select 1 from pg_constraint where conname = 'exercise_logs_duration_min_check') then
    alter table public.exercise_logs add constraint exercise_logs_duration_min_check
      check (duration_min > 0 and duration_min <= 600);
  end if;

  if not exists (select 1 from pg_constraint where conname = 'exercise_logs_calories_burned_check') then
    alter table public.exercise_logs add constraint exercise_logs_calories_burned_check
      check (calories_burned >= 0 and calories_burned <= 15000);
  end if;

  -- weight_logs
  if not exists (select 1 from pg_constraint where conname = 'weight_logs_weight_kg_check') then
    alter table public.weight_logs add constraint weight_logs_weight_kg_check
      check (weight_kg >= 20.0 and weight_kg <= 500.0);
  end if;

  -- burn_plans
  if not exists (select 1 from pg_constraint where conname = 'burn_plans_calories_check') then
    alter table public.burn_plans add constraint burn_plans_calories_check
      check (calories_to_burn > 0 and calories_to_burn <= 50000);
  end if;

  if not exists (select 1 from pg_constraint where conname = 'burn_plans_days_check') then
    alter table public.burn_plans add constraint burn_plans_days_check
      check (days >= 1 and days <= 90);
  end if;
end $$;
