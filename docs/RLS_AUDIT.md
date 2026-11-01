# Row-Level Security (RLS) Policy Audit

Comprehensive audit of all tables and views in `supabase/migrations/001_initial_schema.sql` and `supabase/ALL_MIGRATIONS.sql`.

---

## 1. Policy Completeness Matrix

| Table | RLS Enabled? | SELECT Policy (`using`) | INSERT Policy (`with check`) | UPDATE Policy (`using` & `with check`) | DELETE Policy (`using`) | Notes |
|---|---|---|---|---|---|---|
| **profiles** | **YES** | `auth.uid() = id` | `auth.uid() = id` | `auth.uid() = id` (both) | `auth.uid() = id` | Complete isolation. Users cannot view, modify, or delete another user's profile. |
| **foods** | **YES** | `user_id IS NULL OR user_id = auth.uid()` | `user_id = auth.uid()` | `user_id = auth.uid()` (both) | `user_id = auth.uid()` | Global foods (`user_id IS NULL`) are readable by all authenticated users, but CANNOT be inserted, modified, or deleted by any user. Users can only write/modify their own custom foods. |
| **food_logs** | **YES** | `auth.uid() = user_id` | `auth.uid() = user_id` | `auth.uid() = user_id` (both) | `auth.uid() = user_id` | Complete isolation. User A cannot view, insert, update, or delete User B's food logs. |
| **exercises** | **YES** | `auth.role() = 'authenticated'` | *None (Read-Only)* | *None (Read-Only)* | *None (Read-Only)* | Strict read-only catalog. No write policies exist; regular users and anon are completely blocked from inserting, modifying, or deleting exercises. |
| **exercise_logs** | **YES** | `auth.uid() = user_id` | `auth.uid() = user_id` | `auth.uid() = user_id` (both) | `auth.uid() = user_id` | Complete isolation. Both `using` and `with check` prevent cross-user ID spoofing. |
| **weight_logs** | **YES** | `auth.uid() = user_id` | `auth.uid() = user_id` | `auth.uid() = user_id` (both) | `auth.uid() = user_id` | Complete isolation with `UNIQUE (user_id, logged_on)`. |
| **burn_plans** | **YES** | `auth.uid() = user_id` | `auth.uid() = user_id` | `auth.uid() = user_id` (both) | `auth.uid() = user_id` | Complete isolation for saved calculation plans. |

---

## 2. Views & Stored Procedures

1. **`public.daily_summary` View**:
   - Defined with `WITH (security_invoker = true)`.
   - Ensures any query against `daily_summary` executes under the requesting caller's security context, enforcing child RLS rules from `food_logs`, `exercise_logs`, and `weight_logs`.
2. **`public.handle_new_user()` Trigger**:
   - Declared `SECURITY DEFINER` with `SET search_path = public`.
   - Fires `AFTER INSERT ON auth.users` to initialize the `profiles` row safely under RLS.
3. **`public.delete_my_account()` RPC**:
   - Declared `SECURITY DEFINER` with `SET search_path = ''`.
   - Strictly references `auth.uid()` and throws an exception if unauthenticated.
   - Execution revoked from `anon` and `public`, granted exclusively to `authenticated`.
