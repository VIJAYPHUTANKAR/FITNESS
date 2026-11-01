# FitCalc – Fitness & Nutrition Tracker

FitCalc is a modern, modular full-stack web application designed to help users track dietary intake, monitor macronutrient distributions, log physical exercises, and calculate activity energy equivalents. Built on Next.js 15 (App Router, TypeScript) and Supabase (PostgreSQL with Row Level Security), the platform combines scientifically backed metabolic formulas (Mifflin-St Jeor BMR, TDEE, Compendium of Physical Activities METs) with non-judgmental, health-focused energy tracking.

> [!NOTE]
> **Health & Safety Notice**: All calorie and activity values are estimates for educational tracking. Exercise is not a tool to compensate for eating. Nutritional guidelines enforce minimum daily calorie floors (1,200 kcal for women, 1,500 kcal for men), and sessions over 120 minutes are flagged.

---

## Key Features

- [x] **Authentication & Safe Redirects**: Email/password registration, login, and secure sessions hardened against open-redirect attacks.
- [x] **Interactive Onboarding Wizard**: 3-step calculation of BMR, TDEE, and safety-floor-compliant calorie targets. Minor (under 18) guardrails included.
- [x] **Food Logging & Macro Breakdown**: Search local Indian foods and global Open Food Facts database with debounced fallback, custom portions, and macro breakdowns.
- [x] **Custom Foods Library**: Create and manage homemade dishes, regional recipes, and custom portion sizes.
- [x] **Exercise Logging**: MET-based expenditure calculator across multiple sports, cardio, and strength activities with live burn previews.
- [x] **Activity Equivalents (Burn Calculator)**: Realistic estimation of activity time to use calorie amounts across 1 to 30 days, capped at safe daily physical bounds.
- [x] **History & Analytics**: Interactive Recharts visualizations for 7/14/30-day caloric intake vs. goal, weight progression, macro splits, and weekly streaks.
- [x] **Data Privacy & GDPR Export**: Deterministic, formula-injection-safe CSV export and complete account/data deletion via PostgreSQL RPC.

---

## Tech Stack Summary

- **Frontend**: Next.js 15 (App Router, Turbopack, React 19) + TypeScript
- **Styling**: Tailwind CSS v4
- **Backend / Database**: Supabase (PostgreSQL 15, Auth, Row Level Security)
- **Visualizations**: Recharts
- **Validation**: Zod schema validation
- **Testing**: Jest (Unit/Architecture) + Playwright (End-to-End)

---

## 3-Step Setup Instructions

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment variables
Copy the example environment file and add your Supabase credentials:
```bash
cp .env.example .env.local
```
*(Fill in `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`)*

### 3. Run development server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## "Where is everything?" Table

| Feature / Domain Concept | File or Folder Location | Description |
|---|---|---|
| **Authentication** | [`src/features/auth/`](file:///c:/Users/gaura/OneDrive/Desktop/fitness/src/features/auth) | Login/Signup screens, auth hooks, and services |
| **Onboarding Wizard** | [`src/features/onboarding/`](file:///c:/Users/gaura/OneDrive/Desktop/fitness/src/features/onboarding) | 3-step profile setup and safety floor validation |
| **Dashboard** | [`src/features/dashboard/`](file:///c:/Users/gaura/OneDrive/Desktop/fitness/src/features/dashboard) | Calorie budget ring, macro bar, and net energy banner |
| **Food Logging** | [`src/features/food-log/`](file:///c:/Users/gaura/OneDrive/Desktop/fitness/src/features/food-log) | Daily meal sections, item editing, and search modal |
| **Custom Foods** | [`src/features/custom-foods/`](file:///c:/Users/gaura/OneDrive/Desktop/fitness/src/features/custom-foods) | User-created custom food items and recipes |
| **Exercise Logging** | [`src/features/exercise-log/`](file:///c:/Users/gaura/OneDrive/Desktop/fitness/src/features/exercise-log) | Workout logger, MET burn calculation, and inline edits |
| **Activity Equivalents** | [`src/features/burn-calculator/`](file:///c:/Users/gaura/OneDrive/Desktop/fitness/src/features/burn-calculator) | Paced activity duration calculator and saved plans |
| **History & Trends** | [`src/features/history/`](file:///c:/Users/gaura/OneDrive/Desktop/fitness/src/features/history) | Recharts graphs (caloric trends, weight, macros) |
| **Profile & Settings** | [`src/features/profile/`](file:///c:/Users/gaura/OneDrive/Desktop/fitness/src/features/profile) | Physical stats, quick weigh-ins, CSV export, delete account |
| **App Routing** | [`src/app/`](file:///c:/Users/gaura/OneDrive/Desktop/fitness/src/app) | Thin Next.js page wrappers (4-24 lines each) |
| **BMR / TDEE Math** | [`src/lib/calc/bmr.ts`](file:///c:/Users/gaura/OneDrive/Desktop/fitness/src/lib/calc/bmr.ts) | Mifflin-St Jeor metabolic formulas and safety floors |
| **MET Calculations** | [`src/lib/calc/burn.ts`](file:///c:/Users/gaura/OneDrive/Desktop/fitness/src/lib/calc/burn.ts) | Compendium of Physical Activities burn pacing formulas |
| **Safe Redirects** | [`src/lib/auth/routes.ts`](file:///c:/Users/gaura/OneDrive/Desktop/fitness/src/lib/auth/routes.ts) | Open redirect protection and URL sanitization |
| **Database Migrations** | [`supabase/migrations/`](file:///c:/Users/gaura/OneDrive/Desktop/fitness/supabase/migrations) | PostgreSQL tables, RLS policies, views, and functions |
| **Architecture Guide** | [`docs/ARCHITECTURE.md`](file:///c:/Users/gaura/OneDrive/Desktop/fitness/docs/ARCHITECTURE.md) | Folder tree, layers, and Mermaid architecture diagrams |
| **Refactor Notes** | [`docs/REFACTOR_NOTES.md`](file:///c:/Users/gaura/OneDrive/Desktop/fitness/docs/REFACTOR_NOTES.md) | Architectural observations, code smells, and design choices |

---

## Verification & Testing

```bash
# Run unit tests and architectural boundary checks
npm test

# Run ESLint check (zero warnings enforced)
npm run lint

# Run TypeScript typecheck
npx tsc --noEmit

# Run Next.js production build
npm run build

# Run Playwright end-to-end tests
npm run test:e2e
```
