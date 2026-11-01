-- Migration 009: Universal Drop and Re-creation of Food and Exercise Log Policies
-- Replaces all previous policies on food_logs and exercise_logs dynamically,
-- guaranteeing that older permissive policies are completely removed.
-- Enforces cross-tenant food/exercise isolation on INSERT and UPDATE.

begin;

-- 1. Drop every existing policy on public.food_logs and public.exercise_logs
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

-- 2. Create single unified policy for public.food_logs
create policy "food_logs_authenticated_owner" on public.food_logs
  for all
  to authenticated
  using (auth.uid() = user_id)
  with check (
    auth.uid() = user_id and
    (food_id is null or exists (select 1 from public.foods f where f.id = food_id))
  );

-- 3. Create single unified policy for public.exercise_logs
create policy "exercise_logs_authenticated_owner" on public.exercise_logs
  for all
  to authenticated
  using (auth.uid() = user_id)
  with check (
    auth.uid() = user_id and
    (exercise_id is null or exists (select 1 from public.exercises e where e.id = exercise_id))
  );

-- 4. Explicitly guarantee RLS is enabled on both tables
alter table public.food_logs enable row level security;
alter table public.exercise_logs enable row level security;

commit;
