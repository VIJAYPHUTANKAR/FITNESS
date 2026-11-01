-- Migration 007: Food and Exercise Foreign Key ON DELETE SET NULL and Policy Validation
-- Fixes referential blocking on custom food deletion and prevents cross-user food referencing.

-- 1. Alter food_logs.food_id foreign key constraint to ON DELETE SET NULL
alter table if exists public.food_logs
  drop constraint if exists food_logs_food_id_fkey;

alter table public.food_logs
  add constraint food_logs_food_id_fkey
  foreign key (food_id) references public.foods(id) on delete set null;

-- 2. Alter exercise_logs.exercise_id foreign key constraint to ON DELETE SET NULL
alter table if exists public.exercise_logs
  drop constraint if exists exercise_logs_exercise_id_fkey;

alter table public.exercise_logs
  add constraint exercise_logs_exercise_id_fkey
  foreign key (exercise_id) references public.exercises(id) on delete set null;

-- 3. Update food_logs RLS policy to enforce that referenced foods must be visible to the user
-- (Because public.foods RLS permits reading only global foods or user's own foods,
-- this exists check naturally prevents referencing private custom foods owned by other users)
drop policy if exists "own food logs" on public.food_logs;
create policy "own food logs" on public.food_logs
  for all
  using (auth.uid() = user_id)
  with check (
    auth.uid() = user_id and
    (food_id is null or exists (select 1 from public.foods f where f.id = food_id))
  );

-- 4. Update exercise_logs RLS policy similarly for exercise_id
drop policy if exists "own exercise logs" on public.exercise_logs;
create policy "own exercise logs" on public.exercise_logs
  for all
  using (auth.uid() = user_id)
  with check (
    auth.uid() = user_id and
    (exercise_id is null or exists (select 1 from public.exercises e where e.id = exercise_id))
  );

