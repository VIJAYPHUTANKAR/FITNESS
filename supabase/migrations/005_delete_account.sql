-- ============================================================================
-- 005_delete_account.sql: Secure self-serve account deletion
-- ============================================================================

-- This function allows an authenticated user to permanently delete their own account.
-- Safety:
-- 1. SECURITY DEFINER with set search_path = '' prevents search_path manipulation.
-- 2. Strictly deletes where id = auth.uid(), ensuring callers can never delete another user.
-- 3. Raises an exception immediately if auth.uid() is null (unauthenticated).
-- 4. Foreign keys from profiles, foods, food_logs, exercise_logs, weight_logs, and burn_plans
--    all reference auth.users(id) ON DELETE CASCADE, cleanly wiping all user data.
-- 5. Execution is revoked from anon and public, granted only to authenticated users.

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
