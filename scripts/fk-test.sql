-- scripts/fk-test.sql
-- Verification test for Task 5: ON DELETE SET NULL foreign key behavior
-- Run this in the Supabase SQL Editor.

do $$
declare
  test_user_id uuid;
  test_food_id bigint;
  test_log_id bigint;
  observed_food_id bigint;
  log_exists boolean;
begin
  -- 1. Grab an existing user or generate a dummy auth user id for testing
  select id into test_user_id from auth.users limit 1;

  if test_user_id is null then
    raise notice 'No existing user found in auth.users. Creating temporary test uuid.';
    test_user_id := gen_random_uuid();
  end if;

  -- 2. Insert a temporary custom food
  insert into public.foods (user_id, name, serving_desc, serving_grams, calories_per_100g)
  values (test_user_id, 'Temp FK Test Dish', '100 g', 100, 250)
  returning id into test_food_id;

  raise notice 'Created test custom food id: %', test_food_id;

  -- 3. Insert a food_log referencing this custom food
  insert into public.food_logs (
    user_id, food_id, food_name, logged_on, meal_type, quantity_grams, calories
  )
  values (
    test_user_id, test_food_id, 'Temp FK Test Dish Logged', current_date, 'lunch', 100, 250
  )
  returning id into test_log_id;

  raise notice 'Created test food_log id: % referencing food_id %', test_log_id, test_food_id;

  -- 4. Delete the custom food
  delete from public.foods where id = test_food_id;
  raise notice 'Deleted custom food id: %', test_food_id;

  -- 5. Verify the food_log was NOT deleted and food_id is now NULL
  select (count(*) > 0), min(food_id)
  into log_exists, observed_food_id
  from public.food_logs
  where id = test_log_id;

  if not log_exists then
    raise exception 'TEST FAILED: food_log was deleted when food was deleted!';
  end if;

  if observed_food_id is not null then
    raise exception 'TEST FAILED: food_logs.food_id was not set to NULL! Observed: %', observed_food_id;
  end if;

  raise notice 'TEST PASSED: food_log % survived food deletion and food_id is successfully NULL.', test_log_id;

  -- 6. Clean up the test food log
  delete from public.food_logs where id = test_log_id;
  raise notice 'Cleaned up test food_log id: %', test_log_id;
end $$;
