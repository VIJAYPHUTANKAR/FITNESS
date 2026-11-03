# FitCalc – Comprehensive Project Setup Guide

This document provides a detailed, step-by-step walkthrough for cloning, configuring, migrating, running, and testing the **FitCalc** project from scratch.

---

## Table of Contents
1. [Prerequisites](#1-prerequisites)
2. [Cloning the Repository](#2-cloning-the-repository)
3. [Setting Up Supabase (Database & Auth)](#3-setting-up-supabase-database--auth)
4. [Applying Database Migrations](#4-applying-database-migrations)
5. [Configuring Environment Variables](#5-configuring-environment-variables)
6. [Installing Dependencies](#6-installing-dependencies)
7. [Running the Application Locally](#7-running-the-application-locally)
8. [Running Tests & Quality Checks](#8-running-tests--quality-checks)
9. [Project Architecture & Key Locations](#9-project-architecture--key-locations)
10. [Troubleshooting & Common Questions](#10-troubleshooting--common-questions)

---

## 1. Prerequisites

Before setting up the project, ensure your workstation has the following installed:

- **Node.js**: `v20.x` or `v22.x` LTS ([Download Node.js](https://nodejs.org/))
- **npm**: `v10.x` or higher (comes bundled with Node.js)
- **Git**: Latest version ([Download Git](https://git-scm.com/))
- **Supabase Account**: A free cloud account on [Supabase](https://supabase.com/)

---

## 2. Cloning the Repository

Clone the project from GitHub and navigate into the root directory:

```bash
git clone https://github.com/VIJAYPHUTANKAR/fitness.git
cd fitness
```

Check out the primary branch (`main`):

```bash
git checkout main
```

---

## 3. Setting Up Supabase (Database & Auth)

FitCalc uses Supabase for authentication, PostgreSQL storage, and Row Level Security (RLS).

1. Log in to [Supabase Dashboard](https://supabase.com/dashboard).
2. Click **New Project**.
3. Choose an organization, enter a project name (e.g., `fitcalc`), and set a strong database password.
4. Select your preferred AWS/GCP region (e.g., `ap-south-1` Mumbai if located in India) and click **Create new project**.
5. Wait ~2 minutes for the database instance to initialize.
6. Retrieve your API credentials:
   - Go to **Project Settings** (gear icon in sidebar) $\rightarrow$ **API**.
   - Copy the **Project URL** (e.g., `https://your-project-ref.supabase.co`).
   - Copy the **`anon` `public` API Key** (a long JWT starting with `eyJ...`).
   - > [!CAUTION]
     > **Never** use or expose the `service_role` secret key. FitCalc runs securely on the client and server using only the public `anon` key coupled with PostgreSQL Row Level Security.

7. Enable Email Auth:
   - Go to **Authentication** $\rightarrow$ **Providers** $\rightarrow$ **Email**.
   - Ensure **Enable Email provider** is turned **ON**.
   - *(Optional for development)*: In **Authentication** $\rightarrow$ **URL Configuration**, add `http://localhost:3000/**` to **Redirect URLs**, and toggle **Confirm email** to OFF if you want instant account creation without clicking email confirmation links.

---

## 4. Applying Database Migrations

FitCalc contains 10 sequential, idempotent SQL migrations located in `supabase/migrations/`.

### Option A: 1-Click Setup via SQL Editor (Recommended)
1. In the Supabase Dashboard sidebar, click **SQL Editor**.
2. Click **New query**.
3. Open the file [`supabase/ALL_MIGRATIONS.sql`](file:///c:/Users/gaura/OneDrive/Desktop/fitness/supabase/ALL_MIGRATIONS.sql) in your local editor.
4. Copy the entire file content, paste it into the Supabase SQL Editor, and click **Run**.
5. You will see a success message (`Success. No rows returned` or execution notice).

### Option B: Step-by-Step Migrations (If applying manually)
If you prefer applying each migration individually, execute them in this exact order:
1. `001_initial_schema.sql`: Base tables (`profiles`, `foods`, `food_logs`, `exercises`, `exercise_logs`, `weight_logs`, `burn_plans`) & RLS.
2. `002_seed.sql`: 30 staple Indian foods & 20 MET exercises.
3. `003_functions.sql`: `handle_new_user()` trigger & `daily_summary` view.
4. `004_fix_rls.sql`: Scoped custom food management.
5. `005_fix_date_types.sql`: Normalized ISO `DATE` types to eliminate timezone drift.
6. `006_custom_foods_rls.sql`: Restricted custom food updates and deletions.
7. `007_burn_reframing.sql`: Removed compensatory columns & added `ON DELETE SET NULL` cascades.
8. `008_delete_my_account.sql`: Secure `delete_my_account()` RPC function.
9. `009_replace_log_policies.sql`: Dynamic policy drop & single unified policy creation.
10. `010_indexes_and_cleanup.sql`: Composite performance indexes & adult age trigger.

### Verifying the Database Setup
To confirm that 100% of tables have RLS enabled, all migrations are active, and no policy conflicts exist:
1. In the Supabase SQL Editor, paste the contents of [`scripts/verify-db.sql`](file:///c:/Users/gaura/OneDrive/Desktop/fitness/scripts/verify-db.sql) and click **Run**.
2. Verify:
   - Section 1 returns `OK` across all tables (no duplicate policies).
   - Section 2 returns `PASS` across all 8 migration checks.
   - Section 3 returns `violating_profile_count = 0`.
   - Section 4 returns `0 rows` (meaning 100% of public tables have RLS enabled).

---

## 5. Configuring Environment Variables

In the root directory of the project, create your `.env.local` file from the provided template:

```bash
cp .env.example .env.local
```

Open `.env.local` in your editor and enter your Supabase credentials:

```env
# Supabase configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

> [!NOTE]
> `.env.local` and `.env*.local` are strictly ignored by `.gitignore`. Never commit actual API keys to GitHub.

### Optional: End-to-End Test Credentials
If you wish to run the full Playwright browser test suite against live accounts:
```bash
cp .env.e2e.example .env.e2e
```
Fill in test user credentials for User A and User B. `.env.e2e` is also git-ignored.

---

## 6. Installing Dependencies

Install all project dependencies using `npm`:

```bash
npm install
```

This installs:
- **Next.js 16** with Turbopack & React 19
- **Tailwind CSS v4** & `@tailwindcss/postcss`
- **Supabase JavaScript SDK** (`@supabase/supabase-js`, `@supabase/ssr`)
- **Lucide React** (clean, modern icons)
- **Recharts** (data visualization)
- **Zod** (runtime validation)
- **Playwright** & **Jest** (testing suites)

---

## 7. Running the Application Locally

Start the Next.js development server:

```bash
npm run dev
```

The output will confirm the server is ready:
```
▲ Next.js 16.4.3 (Turbopack)
- Local: http://localhost:3000
✓ Ready in ~1s
```

Open **[http://localhost:3000](http://localhost:3000)** in your browser.

### Key Navigation Routes
| Route | Access | Description |
|:---|:---:|:---|
| [`/`](http://localhost:3000) | Public | Landing page with interactive Indian Thali portion demo |
| [`/login`](http://localhost:3000/login) | Public | Sign in screen with show/hide password and dark mode |
| [`/signup`](http://localhost:3000/signup) | Public | Registration screen with adult age policy |
| [`/onboarding`](http://localhost:3000/onboarding) | Authenticated | 3-step setup (BMR, TDEE, Calorie Goal floor) |
| [`/dashboard`](http://localhost:3000/dashboard) | Authenticated | Daily Thali plate, net energy note, meals summary |
| [`/log/food`](http://localhost:3000/log/food) | Authenticated | Food logger, Indian search modal, portion scaling |
| [`/log/exercise`](http://localhost:3000/log/exercise) | Authenticated | MET activity tracker with live calorie burn preview |
| [`/burn-calculator`](http://localhost:3000/burn-calculator) | Authenticated | Activity Equivalents pacing duration calculator |
| [`/history`](http://localhost:3000/history) | Authenticated | 7/14/30-day intake, weight trendlines, and streaks |
| [`/foods/custom`](http://localhost:3000/foods/custom) | Authenticated | Homemade recipe and custom dish creator |
| [`/profile`](http://localhost:3000/profile) | Authenticated | Metric updates, daily weigh-in, CSV export, delete account |

---

## 8. Running Tests & Quality Checks

FitCalc enforces a comprehensive testing pyramid. You can run all checks locally:

### 1. Unit & Architecture Tests
Verifies metabolic calculations (Mifflin-St Jeor, METs), macro scaling, CSV sanitization, and architectural module boundaries:
```bash
npm test
```
*Expected result: 10 test suites passed, 100 tests passed.*

### 2. Static Code Analysis (ESLint)
Checks for code smells, unused variables, and Next.js best practices:
```bash
npm run lint
```
*Expected result: Clean, 0 errors, 0 warnings.*

### 3. Strict TypeScript Compilation
Validates types across all components, API routes, and database queries:
```bash
npx tsc --noEmit
```
*Expected result: Clean, 0 errors.*

### 4. Production Build
Validates that all 15 static and dynamic routes compile into an optimized production bundle:
```bash
npm run build
```
*Expected result: All routes compiled successfully.*

### 5. Playwright Browser E2E Tests
Executes automated browser tests using headless Chromium:
```bash
npx playwright test
```
*Expected result: 4 unauthenticated tests pass (and 13 authenticated tests pass if credentials exist in `.env.e2e`).*

---

## 9. Project Architecture & Key Locations

FitCalc follows a **strict feature-based modular structure**:

```
src/
├── app/                  # Thin App Router route wrappers (4-24 lines each)
│   ├── (app)/            # Authenticated AppShell (Nav rail, tab bar, header)
│   ├── (auth)/           # Authentication layout
│   ├── api/foods/search/ # Debounced Open Food Facts & Supabase search API
│   ├── globals.css       # Tailwind v4 theme, CSS variables & tokens
│   └── layout.tsx        # Root layout, Google fonts, anti-flicker script
├── components/
│   ├── layout/           # AppShell, NavSidebar, BottomTabBar, ThemeToggle
│   └── ui/               # Button, Sheet, Card, Input, NumberInput, Badge...
├── features/             # Self-contained feature modules
│   ├── auth/             # Login & Signup screens, hooks, auth services
│   ├── burn-calculator/  # Activity Equivalents duration estimator
│   ├── custom-foods/     # Custom recipes and catalog management
│   ├── dashboard/        # Thali Plate SVG, net energy note, meal grids
│   ├── exercise-log/     # MET workout logging and duration editing
│   ├── food-log/         # Daily meal logging and Sheet search modal
│   ├── history/          # Recharts analytics, weekly streaks, log accordion
│   ├── landing/          # Interactive Thali hero demo
│   ├── onboarding/       # 3-step BMR/TDEE setup wizard
│   └── profile/          # Physical statistics, weigh-ins, CSV export
└── lib/                  # Pure domain logic & utilities
    ├── auth/             # Open-redirect protection & route sanitization
    ├── calc/             # BMR, MET burn pacing, macro scaling algorithms
    ├── csv/              # RFC 4180 CSV serializer with formula injection safety
    ├── dates/            # ISO 8601 date math & boundary helpers
    ├── errors/           # Supabase error sanitization
    └── supabase/         # Typed SSR & client-side Supabase client factories
```

---

## 10. Troubleshooting & Common Questions

### Q1: The page renders without styling or CSS looks broken.
- **Cause**: Tailwind CSS v4 requires `@tailwindcss/postcss` and `postcss.config.mjs`.
- **Fix**: Verify `postcss.config.mjs` exists with `{ plugins: { "@tailwindcss/postcss": {} } }` and run `npm install`.

### Q2: Why does logging in redirect me in an infinite loop?
- **Cause**: An older route middleware bug matched `pathname.startsWith('/log')` instead of `pathname.startsWith('/log/')`.
- **Fix**: The latest codebase has this resolved in `src/middleware.ts` and `src/lib/auth/routes.ts`. Ensure you are on the latest `main` commit.

### Q3: When I search for a food, no results appear.
- **Cause**: Migrations were not applied, or the network request to Open Food Facts timed out.
- **Fix**: Ensure `002_seed.sql` has been executed in the Supabase SQL Editor (which seeds 30 staple Indian foods like Roti, Dal, Paneer, Rice, and Idli).

### Q4: Can I run this in Dark Mode?
- **Yes**: Click the Sun/Moon toggle icon in the top navigation bar or on the landing page header. The application supports full automatic system switching and persistent manual theme toggling stored in `localStorage`.

### Q5: How do I export or delete all my data?
- **CSV Export**: Go to **Profile** $\rightarrow$ click **Export Data (CSV)**. All food logs, workouts, and weigh-ins will download as a formula-injection-safe CSV file.
- **Account Deletion**: Go to **Profile** $\rightarrow$ scroll to **Danger Zone** $\rightarrow$ click **Delete Account** $\rightarrow$ type `DELETE` to confirm. This calls the PostgreSQL `delete_my_account()` RPC function, permanently cascading deletion through all your records.

