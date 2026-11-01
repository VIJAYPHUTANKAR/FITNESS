# RLS Verification Guide (Multi-Tenant Isolation)

This guide documents the procedures for testing that Row Level Security (RLS) guarantees data privacy between users.

---

## Method 1: Automated SQL Suite (Supabase SQL Editor)

1. Open your Supabase Dashboard: [https://supabase.com/dashboard/project/ikslcecfyqwkllryvqmp](https://supabase.com/dashboard/project/ikslcecfyqwkllryvqmp)
2. Open the **SQL Editor** (`>_`).
3. Paste the contents of [`scripts/rls-test.sql`](../scripts/rls-test.sql) and click **Run**.

### Expected Result:
```
NOTICE:  === STARTING FITCALC RLS SUITE ===
NOTICE:  [PASS] Check 1: User A successfully created private records.
NOTICE:  [PASS] Check 2: User B cannot select any private data belonging to User A.
NOTICE:  [PASS] Check 3: User B cannot update or delete User A food_logs.
NOTICE:  [PASS] Check 4: User B blocked from inserting rows with User A user_id.
NOTICE:  [PASS] Check 5: Custom foods isolated and global foods protected from tampering.
NOTICE:  [PASS] Check 6: Anon users strictly blocked from all private user tables.
NOTICE:  === ALL RLS SECURITY CHECKS PASSED SUCCESSFULLY ===
Query returned successfully in XXms.
```

---

## Method 2: Manual Browser Verification with Two Separate Accounts

### Step 1: Setup Two Accounts
1. In your primary browser (e.g., Chrome), visit `http://localhost:3000/signup`.
   - Sign up as **User A**: `usera@example.com` / Password: `Password123!`
   - Complete Onboarding (`Weight: 75kg`, `Goal: Lose Fat`).
2. In an **Incognito / Private Window**, visit `http://localhost:3000/signup`.
   - Sign up as **User B**: `userb@example.com` / Password: `Password123!`
   - Complete Onboarding (`Weight: 60kg`, `Goal: Maintain`).

### Step 2: Test Food Logs Isolation
1. As **User A**: Go to `/log/food` and log **"Roti / Chapati" (120g)** under Breakfast.
2. As **User B**: Go to `/log/food`.
   - **PASS**: User B's dashboard and food log show 0 items and 0 kcal.
   - **FAIL**: User B sees "Roti / Chapati" or User A's calorie count.

### Step 3: Test Custom Food Isolation
1. As **User A**: Go to `/foods/custom` and add a custom food named **"Secret Protein Shake A"** (150 kcal/100g).
2. As **User B**: Go to `/foods/custom` and `/log/food` (open Food Search).
   - **PASS**: "Secret Protein Shake A" does NOT appear anywhere for User B.
   - **FAIL**: User B can see or search for User A's custom food.

### Step 4: Test Profile & Goals Isolation
1. As **User A**: Edit profile weight to `76 kg` and daily goal to `1800 kcal`.
2. As **User B**: Refresh `/profile` and `/dashboard`.
   - **PASS**: User B's weight remains `60 kg` and daily goal remains uninfluenced.
   - **FAIL**: User B's profile reflects changes made by User A.

### Step 5: Test Unauthenticated Access
1. Open a new window with NO active session.
2. Directly visit `http://localhost:3000/dashboard`, `http://localhost:3000/log/food`, or `http://localhost:3000/profile`.
   - **PASS**: The browser immediately redirects to `/login`.
   - **FAIL**: Any private dashboard or log data renders without credentials.
