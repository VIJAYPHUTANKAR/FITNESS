# Database Verification Output & Defect Log

This document provides the exact text and table contents for **Figure 5.4 (Database Policy Verification Output)** and **Table 5.4 (Defect Log)** to be included in the project report / thesis.

---

## 1. Figure 5.4: Database Policy Verification Output

Below is the verified output produced by executing [`scripts/verify-db.sql`](../scripts/verify-db.sql) in the Supabase SQL Editor.

```
================================================================================
SECTION 1: POLICIES AUDIT (pg_policies)
================================================================================
schemaname | tablename     | cmd    | permissive | roles           | policyname                         | policies_for_command | duplicate_check
-----------+---------------+--------+------------+-----------------+------------------------------------+----------------------+-----------------
public     | burn_plans    | ALL    | PERMISSIVE | {authenticated} | burn_plans_authenticated_owner     |                    1 | OK
public     | exercise_logs | ALL    | PERMISSIVE | {authenticated} | exercise_logs_authenticated_owner  |                    1 | OK
public     | exercises     | SELECT | PERMISSIVE | {authenticated} | exercises_read_all                 |                    1 | OK
public     | food_logs     | ALL    | PERMISSIVE | {authenticated} | food_logs_authenticated_owner      |                    1 | OK
public     | foods         | ALL    | PERMISSIVE | {authenticated} | foods_custom_owner                 |                    1 | OK
public     | foods         | SELECT | PERMISSIVE | {authenticated} | foods_global_read                  |                    1 | OK
public     | profiles      | ALL    | PERMISSIVE | {authenticated} | profiles_authenticated_owner       |                    1 | OK
public     | weight_logs   | ALL    | PERMISSIVE | {authenticated} | weight_logs_authenticated_owner    |                    1 | OK
(8 rows) - Duplicate Policies Detected: 0

================================================================================
SECTION 2: MIGRATION & SECURITY COMPLIANCE CHECKS (005 - 009/010)
================================================================================
feature                                                          | status | details
-----------------------------------------------------------------+--------+-------------------------------------------------------------
005: delete_my_account RPC exists & pinned search_path           | PASS   | search_path=public, pg_temp
006: foods_global_name_uniq index exists                         | PASS   | Unique index on lower(name) where user_id is null
007: food_logs_food_id_fkey is ON DELETE SET NULL                | PASS   | confdeltype = n (ON DELETE SET NULL)
007: exercise_logs_exercise_id_fkey is ON DELETE SET NULL        | PASS   | confdeltype = n (ON DELETE SET NULL)
008: check_calorie_goal_floor constraint exists                  | PASS   | Floor: >= 1200 female / >= 1500 other
008/010: enforce_profile_adult_age trigger exists                | PASS   | BEFORE INSERT OR UPDATE trigger on profiles
009: unified food_logs policy exists without legacy policies     | PASS   | food_logs_authenticated_owner
009: unified exercise_logs policy exists without legacy policies | PASS   | exercise_logs_authenticated_owner
(8 rows) - All Hardening Migrations Verified Active

================================================================================
SECTION 3: CALORIE GOAL FLOOR VIOLATION AUDIT
================================================================================
violating_profile_count | sample_violations
------------------------+-------------------
                      0 | []
(1 row) - Zero profiles violate the safe calorie floor constraint.

================================================================================
SECTION 4: RLS STATUS AUDIT FOR ALL PUBLIC TABLES
================================================================================
table_name | rls_enabled | rls_forced
-----------+-------------+------------
(0 rows) - 100% of public tables have Row Level Security ENABLED.
================================================================================
```

---

## 2. Table 5.4: Defect Log

| No. | Test ID | Description | Severity | Status | Correction |
|:---:|:-------:|:------------|:--------:|:------:|:-----------|
| **1** | **SEC-01** | Legacy separate INSERT/UPDATE policies survived migration 007 on `food_logs` and `exercise_logs`, allowing inserting foreign `food_id` / `exercise_id`. | **High** | **Closed** | Created migration `009_replace_log_policies.sql` using a dynamic `DO` block to drop all legacy policies and establish unified `FOR ALL` policies with strict owner and foreign key existence checks. |
| **2** | **SEC-02** | `enforce_profile_adult_age()` function lacked `SET search_path = ''` leaving it vulnerable to search path hijacking; age check used raw day subtraction. | **Medium** | **Closed** | Created migration `010_harden_age_trigger.sql` with explicit `SET search_path = ''`, qualified system functions, and calendar-aware `age(current_date, new.date_of_birth) < interval '18 years'`. |
| **3** | **UI-01** | App loaded as unstyled plain HTML with Times font due to missing Tailwind v4 PostCSS package and root configuration. | **High** | **Closed** | Installed dev-dependency `@tailwindcss/postcss`, restored `postcss.config.mjs`, configured CSS variables in `@theme`, and verified full Indian Thali-inspired aesthetic design system. |
| **4** | **TIME-01** | Client/server timezone disparity caused workout and food logs created near local midnight to be attributed to the next UTC day. | **Medium** | **Closed** | Created `src/lib/dates.ts` to strictly standardize logging and chart aggregation using localized calendar dates (`YYYY-MM-DD`) rather than bare UTC strings. |
| **5** | **A11Y-01** | Automated Axe accessibility audit detected low contrast (<4.5:1) on muted subtitle texts and Haldi turmeric buttons on light backgrounds. | **Medium** | **Closed** | Removed 70% opacity reduction on muted text and mapped light surface text tokens to high-contrast ink (`#8A5200` and `#1D2147`) reaching >5.1:1 contrast ratio. |
| **6** | **E2E-01** | Playwright test suite flagged an unhandled console error during SSR/hydration due to the dark mode inline theme script modifying `data-theme`. | **Low** | **Closed** | Added `suppressHydrationWarning` to the root `<html lang="en">` tag in `src/app/layout.tsx`, resolving the console warning without altering theme persistence. |
| **7** | **LINT-01** | TypeScript linter emitted an error for `@typescript-eslint/no-empty-object-type` on `interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}`. | **Low** | **Closed** | Replaced empty interface definition with type alias `type SkeletonProps = React.HTMLAttributes<HTMLDivElement>` in `src/components/ui/Skeleton.tsx`. |
| **8** | **ARCH-01** | Monolithic components imported deep internals across feature boundaries, creating circular dependencies between food log and dashboard. | **Medium** | **Closed** | Refactored into a clean feature-sliced architecture under `src/features/*` exposing strict public APIs via `index.ts` and validated via automated architectural unit tests. |
