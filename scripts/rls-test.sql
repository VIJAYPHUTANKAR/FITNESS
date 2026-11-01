-- ============================================================================
-- FitCalc RLS Test Script
-- Run this in the Supabase SQL Editor to verify complete multi-tenant isolation.
-- This script simulates:
-- 1. Unauthenticated (anon) requests
-- 2. User A (uuid: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa')
-- 3. User B (uuid: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb')
-- ============================================================================

do $$
declare
  v_user_a uuid := 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
  v_user_b uuid := 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
  v_food_log_id bigint;
  v_custom_food_id bigint;
  v_count int;
begin
  raise notice '=== STARTING FITCALC RLS SUITE ===';

  -- Setup dummy users in auth.users if not present (only for testing)
  insert into auth.users (id, aud, role, email)
  values
    (v_user_a, 'authenticated', 'authenticated', 'usera@example.com'),
    (v_user_b, 'authenticated', 'authenticated', 'userb@example.com')
  on conflict (id) do nothing;

  -- --------------------------------------------------------------------------
  -- CHECK 1: User A inserts profile, food log, custom food, exercise log, weight log
  -- --------------------------------------------------------------------------
  set local role authenticated;
  execute format('set local request.jwt.claims = %L', json_build_object('sub', v_user_a, 'role', 'authenticated')::text);

  insert into profiles (id, full_name, weight_kg, height_cm, daily_calorie_goal)
  values (v_user_a, 'User A', 70.0, 175.0, 2000)
  on conflict (id) do update set full_name = 'User A';

  insert into foods (user_id, name, serving_desc, serving_grams, calories_per_100g)
  values (v_user_a, 'User A Secret Recipe', '1 bowl', 200, 150)
  returning id into v_custom_food_id;

  insert into food_logs (user_id, food_name, logged_on, quantity_grams, calories)
  values (v_user_a, 'User A Apple', current_date, 150, 78)
  returning id into v_food_log_id;

  insert into exercise_logs (user_id, exercise_name, logged_on, duration_min, calories_burned)
  values (v_user_a, 'User A Running', current_date, 30, 250);

  insert into weight_logs (user_id, logged_on, weight_kg)
  values (v_user_a, current_date, 70.5)
  on conflict (user_id, logged_on) do nothing;

  insert into burn_plans (user_id, calories_to_burn, days, plan)
  values (v_user_a, 500, 2, '[]'::jsonb);

  raise notice '[PASS] Check 1: User A successfully created private records.';

  -- --------------------------------------------------------------------------
  -- CHECK 2: User B CANNOT read User A food_logs, profiles, exercise_logs, weight_logs, burn_plans
  -- --------------------------------------------------------------------------
  set local role authenticated;
  execute format('set local request.jwt.claims = %L', json_build_object('sub', v_user_b, 'role', 'authenticated')::text);

  -- Food logs
  select count(*) into v_count from food_logs where user_id = v_user_a;
  if v_count > 0 then
    raise exception '[FAIL] Check 2: User B could SELECT User A food_logs!';
  end if;

  -- Profiles
  select count(*) into v_count from profiles where id = v_user_a;
  if v_count > 0 then
    raise exception '[FAIL] Check 2: User B could SELECT User A profile!';
  end if;

  -- Exercise logs
  select count(*) into v_count from exercise_logs where user_id = v_user_a;
  if v_count > 0 then
    raise exception '[FAIL] Check 2: User B could SELECT User A exercise_logs!';
  end if;

  -- Weight logs
  select count(*) into v_count from weight_logs where user_id = v_user_a;
  if v_count > 0 then
    raise exception '[FAIL] Check 2: User B could SELECT User A weight_logs!';
  end if;

  -- Burn plans
  select count(*) into v_count from burn_plans where user_id = v_user_a;
  if v_count > 0 then
    raise exception '[FAIL] Check 2: User B could SELECT User A burn_plans!';
  end if;

  raise notice '[PASS] Check 2: User B cannot select any private data belonging to User A.';

  -- --------------------------------------------------------------------------
  -- CHECK 3: User B CANNOT update or delete User A food_logs
  -- --------------------------------------------------------------------------
  update food_logs set food_name = 'Hacked' where id = v_food_log_id;
  delete from food_logs where id = v_food_log_id;

  -- Switch to superuser/postgres to check if row is untouched
  reset role;
  select count(*) into v_count from food_logs where id = v_food_log_id and food_name = 'User A Apple';
  if v_count <> 1 then
    raise exception '[FAIL] Check 3: User B was able to modify or delete User A food_log!';
  end if;
  raise notice '[PASS] Check 3: User B cannot update or delete User A food_logs.';

  -- --------------------------------------------------------------------------
  -- CHECK 4: User B CANNOT insert a food_log with user_id = User A (Spoofing)
  -- --------------------------------------------------------------------------
  set local role authenticated;
  execute format('set local request.jwt.claims = %L', json_build_object('sub', v_user_b, 'role', 'authenticated')::text);

  begin
    insert into food_logs (user_id, food_name, logged_on, quantity_grams, calories)
    values (v_user_a, 'Spoofed by B', current_date, 100, 100);
    raise exception '[FAIL] Check 4: User B was allowed to insert with user_id = User A!';
  exception when others then
    if sqlerrm like '%[FAIL]%' then raise exception '%', sqlerrm; end if;
    raise notice '[PASS] Check 4: User B blocked from inserting rows with User A user_id.';
  end;

  -- --------------------------------------------------------------------------
  -- CHECK 5: User B CANNOT see User A custom foods, and CANNOT modify global foods
  -- --------------------------------------------------------------------------
  set local role authenticated;
  execute format('set local request.jwt.claims = %L', json_build_object('sub', v_user_b, 'role', 'authenticated')::text);

  select count(*) into v_count from foods where id = v_custom_food_id;
  if v_count > 0 then
    raise exception '[FAIL] Check 5: User B could see User A custom food!';
  end if;

  -- Try to update a global food
  update foods set name = 'Hacked Global' where user_id is null;
  reset role;
  select count(*) into v_count from foods where name = 'Hacked Global';
  if v_count > 0 then
    raise exception '[FAIL] Check 5: User B was able to modify global foods!';
  end if;
  raise notice '[PASS] Check 5: Custom foods isolated and global foods protected from tampering.';

  -- --------------------------------------------------------------------------
  -- CHECK 6: Unauthenticated (anon) requests return NOTHING for user tables
  -- --------------------------------------------------------------------------
  set local role anon;
  select count(*) into v_count from profiles;
  if v_count > 0 then raise exception '[FAIL] Check 6: Anon user could read profiles!'; end if;

  select count(*) into v_count from food_logs;
  if v_count > 0 then raise exception '[FAIL] Check 6: Anon user could read food_logs!'; end if;

  select count(*) into v_count from exercise_logs;
  if v_count > 0 then raise exception '[FAIL] Check 6: Anon user could read exercise_logs!'; end if;

  select count(*) into v_count from weight_logs;
  if v_count > 0 then raise exception '[FAIL] Check 6: Anon user could read weight_logs!'; end if;

  select count(*) into v_count from burn_plans;
  if v_count > 0 then raise exception '[FAIL] Check 6: Anon user could read burn_plans!'; end if;

  raise notice '[PASS] Check 6: Anon users strictly blocked from all private user tables.';

  -- --------------------------------------------------------------------------
  -- CLEANUP TEST DATA
  -- --------------------------------------------------------------------------
  reset role;
  delete from food_logs where user_id in (v_user_a, v_user_b);
  delete from exercise_logs where user_id in (v_user_a, v_user_b);
  delete from weight_logs where user_id in (v_user_a, v_user_b);
  delete from burn_plans where user_id in (v_user_a, v_user_b);
  delete from foods where user_id in (v_user_a, v_user_b);
  delete from profiles where id in (v_user_a, v_user_b);
  delete from auth.users where id in (v_user_a, v_user_b);

  raise notice '=== ALL RLS SECURITY CHECKS PASSED SUCCESSFULLY ===';
end $$;
