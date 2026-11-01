-- =============================================================
-- 004_check_constraints.sql  –  Data validation constraints
-- =============================================================

-- ── Profiles Constraints ──────────────────────────────────────
do $$ begin
  alter table profiles add constraint profiles_weight_kg_check
    check (weight_kg is null or (weight_kg >= 20.0 and weight_kg <= 500.0));
exception when duplicate_object then null;
end $$;

do $$ begin
  alter table profiles add constraint profiles_height_cm_check
    check (height_cm is null or (height_cm >= 50.0 and height_cm <= 260.0));
exception when duplicate_object then null;
end $$;

do $$ begin
  alter table profiles add constraint profiles_daily_calorie_goal_check
    check (daily_calorie_goal is null or (daily_calorie_goal >= 500 and daily_calorie_goal <= 10000));
exception when duplicate_object then null;
end $$;

-- ── Foods Constraints ─────────────────────────────────────────
do $$ begin
  alter table foods add constraint foods_calories_per_100g_check
    check (calories_per_100g >= 0 and calories_per_100g <= 1000);
exception when duplicate_object then null;
end $$;

do $$ begin
  alter table foods add constraint foods_serving_grams_check
    check (serving_grams is null or (serving_grams > 0 and serving_grams <= 5000));
exception when duplicate_object then null;
end $$;

do $$ begin
  alter table foods add constraint foods_macros_check
    check (
      (protein_g is null or (protein_g >= 0 and protein_g <= 100)) and
      (carbs_g is null or (carbs_g >= 0 and carbs_g <= 100)) and
      (fat_g is null or (fat_g >= 0 and fat_g <= 100)) and
      (fiber_g is null or (fiber_g >= 0 and fiber_g <= 100))
    );
exception when duplicate_object then null;
end $$;

-- ── Food Logs Constraints ─────────────────────────────────────
do $$ begin
  alter table food_logs add constraint food_logs_quantity_grams_check
    check (quantity_grams > 0 and quantity_grams <= 5000);
exception when duplicate_object then null;
end $$;

do $$ begin
  alter table food_logs add constraint food_logs_calories_check
    check (calories >= 0 and calories <= 20000);
exception when duplicate_object then null;
end $$;

do $$ begin
  alter table food_logs add constraint food_logs_macros_check
    check (
      (protein_g is null or protein_g >= 0) and
      (carbs_g is null or carbs_g >= 0) and
      (fat_g is null or fat_g >= 0)
    );
exception when duplicate_object then null;
end $$;

-- ── Exercises Constraints ─────────────────────────────────────
do $$ begin
  alter table exercises add constraint exercises_met_check
    check (met > 0 and met <= 30.0);
exception when duplicate_object then null;
end $$;

-- ── Exercise Logs Constraints ─────────────────────────────────
do $$ begin
  alter table exercise_logs add constraint exercise_logs_duration_min_check
    check (duration_min > 0 and duration_min <= 600);
exception when duplicate_object then null;
end $$;

do $$ begin
  alter table exercise_logs add constraint exercise_logs_calories_burned_check
    check (calories_burned >= 0 and calories_burned <= 15000);
exception when duplicate_object then null;
end $$;

-- ── Weight Logs Constraints ───────────────────────────────────
do $$ begin
  alter table weight_logs add constraint weight_logs_weight_kg_check
    check (weight_kg >= 20.0 and weight_kg <= 500.0);
exception when duplicate_object then null;
end $$;

-- ── Burn Plans Constraints ────────────────────────────────────
do $$ begin
  alter table burn_plans add constraint burn_plans_calories_check
    check (calories_to_burn > 0 and calories_to_burn <= 50000);
exception when duplicate_object then null;
end $$;

do $$ begin
  alter table burn_plans add constraint burn_plans_days_check
    check (days >= 1 and days <= 90);
exception when duplicate_object then null;
end $$;
