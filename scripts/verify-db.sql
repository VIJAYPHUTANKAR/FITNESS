-- ============================================================================
-- FitCalc: Database Verification and Audit Script
-- ============================================================================
-- Run this in the Supabase SQL Editor to audit database schema, RLS policies,
-- migrations (005 through 009/010), constraints, and health checks.
-- ============================================================================

-- ============================================================================
-- 1. POLICIES AUDIT (pg_policies)
-- Lists all policies on public tables, showing cmd, permissive, roles, qual,
-- and with_check. Flags tables that have more than 1 policy for the same cmd.
-- ============================================================================
select 
  schemaname,
  tablename,
  cmd,
  permissive,
  roles,
  policyname,
  qual,
  with_check,
  count(*) over (partition by schemaname, tablename, cmd) as policies_for_command,
  case 
    when count(*) over (partition by schemaname, tablename, cmd) > 1 then 'FLAG: MULTIPLE POLICIES'
    else 'OK'
  end as duplicate_check
from pg_policies
where schemaname = 'public'
order by tablename, cmd, policyname;

-- ============================================================================
-- 2. MIGRATION & SECURITY COMPLIANCE CHECKS (Migrations 005 - 009/010)
-- Verifies whether all hardening migrations have been applied properly.
-- ============================================================================
select
  '005: delete_my_account RPC exists & pinned search_path' as feature,
  case 
    when exists (
      select 1 from pg_proc p
      join pg_namespace n on n.oid = p.pronamespace
      where n.nspname = 'public' and p.proname = 'delete_my_account'
        and exists (
          select 1 from unnest(p.proconfig) cfg where cfg like 'search_path=%'
        )
    ) then 'PASS'
    else 'FAIL'
  end as status,
  (
    select coalesce(array_to_string(p.proconfig, ', '), 'NO CONFIG')
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.proname = 'delete_my_account'
  ) as details

union all

select
  '006: foods_global_name_uniq index exists' as feature,
  case 
    when exists (
      select 1 from pg_indexes
      where schemaname = 'public' and tablename = 'foods' and indexname = 'foods_global_name_uniq'
    ) then 'PASS'
    else 'FAIL'
  end as status,
  'Unique index on lower(name) where user_id is null' as details

union all

select
  '007: food_logs_food_id_fkey is ON DELETE SET NULL' as feature,
  case 
    when exists (
      select 1 from pg_constraint
      where conname = 'food_logs_food_id_fkey' and confdeltype = 'n'
    ) then 'PASS'
    else 'FAIL'
  end as status,
  'confdeltype = n (ON DELETE SET NULL)' as details

union all

select
  '007: exercise_logs_exercise_id_fkey is ON DELETE SET NULL' as feature,
  case 
    when exists (
      select 1 from pg_constraint
      where conname = 'exercise_logs_exercise_id_fkey' and confdeltype = 'n'
    ) then 'PASS'
    else 'FAIL'
  end as status,
  'confdeltype = n (ON DELETE SET NULL)' as details

union all

select
  '008: check_calorie_goal_floor constraint exists' as feature,
  case 
    when exists (
      select 1 from pg_constraint
      where conname = 'check_calorie_goal_floor'
    ) then 'PASS'
    else 'FAIL'
  end as status,
  'Floor: >= 1200 female / >= 1500 other' as details

union all

select
  '008/010: enforce_profile_adult_age trigger exists' as feature,
  case 
    when exists (
      select 1 from pg_trigger t
      join pg_class c on c.oid = t.tgrelid
      join pg_namespace n on n.oid = c.relnamespace
      where n.nspname = 'public' and c.relname = 'profiles'
        and t.tgname in ('enforce_profile_adult_age_trigger', 'enforce_profile_adult_age')
        and not t.tgisinternal
    ) then 'PASS'
    else 'FAIL'
  end as status,
  'BEFORE INSERT OR UPDATE trigger on profiles' as details

union all

select
  '009: unified food_logs policy exists without legacy policies' as feature,
  case 
    when exists (
      select 1 from pg_policies
      where schemaname = 'public' and tablename = 'food_logs' and policyname = 'food_logs_authenticated_owner'
    ) and (
      select count(*) from pg_policies where schemaname = 'public' and tablename = 'food_logs'
    ) = 1 then 'PASS'
    else 'FAIL'
  end as status,
  (select string_agg(policyname, ', ') from pg_policies where schemaname = 'public' and tablename = 'food_logs') as details

union all

select
  '009: unified exercise_logs policy exists without legacy policies' as feature,
  case 
    when exists (
      select 1 from pg_policies
      where schemaname = 'public' and tablename = 'exercise_logs' and policyname = 'exercise_logs_authenticated_owner'
    ) and (
      select count(*) from pg_policies where schemaname = 'public' and tablename = 'exercise_logs'
    ) = 1 then 'PASS'
    else 'FAIL'
  end as status,
  (select string_agg(policyname, ', ') from pg_policies where schemaname = 'public' and tablename = 'exercise_logs') as details;

-- ============================================================================
-- 3. CALORIE GOAL FLOOR VIOLATION AUDIT
-- Counts rows in profiles violating the safe calorie goal floor.
-- ============================================================================
select 
  count(*) as violating_profile_count,
  coalesce(json_agg(json_build_object('id', id, 'gender', gender, 'daily_calorie_goal', daily_calorie_goal)), '[]'::json) as sample_violations
from public.profiles
where daily_calorie_goal is not null
  and (
    (gender = 'female' and daily_calorie_goal < 1200) or
    (coalesce(gender, '') <> 'female' and daily_calorie_goal < 1500)
  );

-- ============================================================================
-- 4. RLS DISABLED AUDIT
-- Returns any tables in the public schema where RLS is NOT enabled.
-- Should return 0 rows.
-- ============================================================================
select 
  c.relname as table_name,
  c.relrowsecurity as rls_enabled,
  c.relforcerowsecurity as rls_forced
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relkind = 'r'
  and c.relrowsecurity = false;
