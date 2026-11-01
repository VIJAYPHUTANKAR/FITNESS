# Row-Level Security (RLS) Policy Audit

Comprehensive audit of all tables and views in `supabase/migrations/001_initial_schema.sql` through `009_replace_log_policies.sql`, and `supabase/ALL_MIGRATIONS.sql`.

---

## 1. Policy Completeness Matrix

| Table | RLS Enabled? | Policy Name | Command / Roles | Qual (`using`) | Check (`with check`) | Security Notes |
|---|---|---|---|---|---|---|
| **profiles** | **YES** | `own profile` | `ALL` / `public` | `auth.uid() = id` | `auth.uid() = id` | Complete tenant isolation. Users cannot view, modify, or delete another user's profile. |
| **foods** | **YES** | `read foods`<br>`manage own foods` | `SELECT` / `public`<br>`ALL` / `public` | `user_id IS NULL OR user_id = auth.uid()`<br>`user_id = auth.uid()` | *N/A*<br>`user_id = auth.uid()` | Global foods (`user_id IS NULL`) are readable by all authenticated users, but CANNOT be inserted, modified, or deleted by any user. Users can only write/modify/delete their own custom foods. |
| **food_logs** | **YES** | `food_logs_authenticated_owner` | `ALL` / `authenticated` | `auth.uid() = user_id` | `auth.uid() = user_id AND (food_id IS NULL OR EXISTS (SELECT 1 FROM public.foods f WHERE f.id = food_id))` | Unified policy (Migration 009) replaces all prior permissive policies. Subquery on `public.foods` ensures users can only log foods they have permission to view (global or own). `food_id` FK uses `ON DELETE SET NULL`. |
| **exercises** | **YES** | `read exercises` | `SELECT` / `authenticated` | `true` | *None (Read-Only)* | Strict read-only catalog. Regular users and anon are completely blocked from inserting, modifying, or deleting exercises. |
| **exercise_logs** | **YES** | `exercise_logs_authenticated_owner` | `ALL` / `authenticated` | `auth.uid() = user_id` | `auth.uid() = user_id AND (exercise_id IS NULL OR EXISTS (SELECT 1 FROM public.exercises e WHERE e.id = exercise_id))` | Unified policy (Migration 009). `exercise_id` FK uses `ON DELETE SET NULL`. Enforces tenant isolation on both reads and writes. |
| **weight_logs** | **YES** | `own weight logs` | `ALL` / `public` | `auth.uid() = user_id` | `auth.uid() = user_id` | Complete isolation with `UNIQUE (user_id, logged_on)`. |
| **burn_plans** | **YES** | `own burn plans` | `ALL` / `public` | `auth.uid() = user_id` | `auth.uid() = user_id` | Complete isolation for saved calculation plans. |

---

## 2. Universal Drop and Single-Policy Guarantee (Migration 009)

In PostgreSQL, multiple permissive policies for the same action on a table are combined with a logical `OR`. If older policies (such as individual `SELECT`, `INSERT`, `UPDATE`, `DELETE` policies or alternate names) exist alongside a new restrictive policy, the older permissive policies will bypass the restrictive checks.

Migration 009 resolves this decisively:
1. Dynamically discovers and drops **every** existing policy on `public.food_logs` and `public.exercise_logs` using a `DO` block iterating over `pg_policies`.
2. Creates exactly **one** consolidated policy per table:
   - `food_logs_authenticated_owner` on `public.food_logs`
   - `exercise_logs_authenticated_owner` on `public.exercise_logs`
3. Guarantees that no legacy or orphaned permissive policies survive.
4. Leaves RLS strictly enabled on both tables.

---

## 3. Foreign Key Cascade & Referential Integrity (Migration 007 & 009)

1. **`food_logs.food_id` Foreign Key**:
   - Altered to `ON DELETE SET NULL`.
   - When a user deletes a custom food from their custom library, existing food log entries referencing that food remain intact (with food name, calories, and macros preserved) and `food_id` safely transitions to `NULL`.
   - The foreign key constraint no longer blocks custom food deletion.
2. **`exercise_logs.exercise_id` Foreign Key**:
   - Altered to `ON DELETE SET NULL`.
3. **Cross-Tenant Food ID Isolation**:
   - `food_logs` WITH CHECK policy validates `(food_id IS NULL OR EXISTS (SELECT 1 FROM public.foods f WHERE f.id = food_id))`.
   - Because `foods` table RLS restricts visibility to global items and the caller's own custom foods, attempting to log another user's custom food ID fails policy validation at the database level.

---

## 4. Views & Stored Procedures

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

---

## 5. Verification Script

To audit all policies and verify migration compliance in a live Supabase environment, run:
```bash
scripts/verify-db.sql
```
This script validates:
- Exactly 1 policy exists per command on each table (no orphaned permissive policies).
- Migrations 005 through 009/010 features are active (`delete_my_account`, unique indexes, ON DELETE SET NULL, adult age trigger, calorie floor constraint).
- Calorie floor compliance count on existing profiles.
- 100% of tables in `public` have RLS enabled.
