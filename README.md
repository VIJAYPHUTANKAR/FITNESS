# FitCalc – Thoughtful Indian Nutrition & Calorie Tracker

[![Next.js](https://img.shields.io/badge/Next.js-16.4.3-black?logo=next.js)](https://nextjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6?logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL_15-3ecf8e?logo=supabase)](https://supabase.com/)
[![Jest](https://img.shields.io/badge/Tests-100%25_Passing-brightgreen?logo=jest)](https://jestjs.io/)
[![Playwright](https://img.shields.io/badge/E2E-Playwright-orange?logo=playwright)](https://playwright.dev/)
[![Accessibility](https://img.shields.io/badge/Accessibility-WCAG_2.1_AA-purple)](https://www.w3.org/WAI/standards-guidelines/wcag/)

**FitCalc** is an intentional, culturally attuned nutrition and physical activity tracker designed specifically for Indian diets and lifestyle realities. Rather than relying on Western calorie-counting tropes, neon gamification, or moralistic "burn-off" language, FitCalc frames daily energy intake around the traditional **Thali Plate** mental model—balancing energy in the center with proportional macronutrient *katoris* (bowls) along the rim.

You may view more info in **DOCS** folder.

Built with **Next.js 16 (App Router with Turbopack)**, **Tailwind CSS v4**, and **Supabase (PostgreSQL with Row Level Security)**, FitCalc pairs rigorous metabolic science with a calm, disciplined editorial user experience.

---

> [!IMPORTANT]
> **Health & Safety Notice**: All energy values are estimates intended for educational self-reflection. Physical exercise is not a tool to compensate for eating. Nutritional guidelines enforce hard minimum daily calorie targets ($1,200\text{ kcal}$ for biological females, $1,500\text{ kcal}$ for biological males), workouts over $120\text{ minutes}$ trigger safety notices, and registration is restricted to adults ($18+$). If food or exercise feels stressful or out of control, please consult a medical practitioner or counselor.

---

## Table of Contents
1. [Cultural Identity & Design Philosophy](#cultural-identity--design-philosophy)
2. [Key Features Overview](#key-features-overview)
3. [Design System & Color Tokens](#design-system--color-tokens)
4. [Architecture & Folder Structure](#architecture--folder-structure)
5. [Database & Security Model](#database--security-model)
6. [Quick Start & Setup Guide](#quick-start--setup-guide)
7. [Testing & Verification](#testing--verification)
8. [Visual Gallery & Screenshots](#visual-gallery--screenshots)
9. [Mathematical & Metabolic Formulas](#mathematical--metabolic-formulas)

---

## Cultural Identity & Design Philosophy

Western fitness trackers often fail Indian meals: a single bowl of *Dal Tadka* or *Moong Dal Khichdi* cannot be broken into generic Western items without losing portion fidelity. FitCalc tackles this directly:

1. **The Thali Plate Signature**: An interactive SVG visualization inspired by traditional Indian stainless-steel and brass thalis. The central plate displays net daily energy eaten against your maintenance budget, surrounded by three proportional katori arcs:
   - **Chukandar** (*Beetroot* `#B1275B`): Protein share
   - **Haldi** (*Turmeric* `#F2B01E`): Carbohydrate share
   - **Patta** (*Curry Leaf* `#327349`): Healthy dietary fat share
2. **Quiet, Editorial Tone**: No guilt-inducing red alert banners, screaming progress rings, or motivational platitudes. Data is shown in tabular numerals with clear source attribution.
3. **Indian Food Database**: Out-of-the-box support for regional staples (Roti, Dal, Paneer Bhurji, Idli, Poha, Upma, Khichdi) with automatic fallback to Open Food Facts (ODbL) for packaged foods.
4. **Non-Compensatory Exercise Framing**: We renamed "burn calculators" to **Activity Equivalents**, framing physical activity purely as time spent in healthy movement rather than a transaction to "earn" or "offset" food.

---

## Key Features Overview

| Feature | Description | Key Components |
|---|---|---|
| **Thali Plate Dashboard** | Central visual signature displaying daily budget, live macro bowls, calm net energy note, and meal summaries. | [`ThaliPlate.tsx`](file:///c:/Users/gaura/OneDrive/Desktop/fitness/src/features/dashboard/components/ThaliPlate.tsx), [`NetEnergyBanner.tsx`](file:///c:/Users/gaura/OneDrive/Desktop/fitness/src/features/dashboard/components/NetEnergyBanner.tsx) |
| **Interactive Landing Page** | Public hero with an interactive portion slider ($30\text{g} - 300\text{g}$) demonstrating live katori proportions with sample Indian foods. | [`InteractivePlateDemo.tsx`](file:///c:/Users/gaura/OneDrive/Desktop/fitness/src/features/landing/components/InteractivePlateDemo.tsx) |
| **Food Logging** | Categorized into Breakfast, Lunch, Dinner, and Snacks. Features sheet-based search modal, grams stepper, live scaling, and inline edits. | [`FoodLogScreen.tsx`](file:///c:/Users/gaura/OneDrive/Desktop/fitness/src/features/food-log/components/FoodLogScreen.tsx), [`FoodSearch.tsx`](file:///c:/Users/gaura/OneDrive/Desktop/fitness/src/features/food-log/components/FoodSearch.tsx) |
| **Custom Foods Catalog** | User-created library for homemade family recipes, regional preparations, or packaged goods with per-$100\text{g}$ macronutrient inputs. | [`CustomFoodsScreen.tsx`](file:///c:/Users/gaura/OneDrive/Desktop/fitness/src/features/custom-foods/components/CustomFoodsScreen.tsx) |
| **Exercise Tracking** | Compendium of Physical Activities MET calculations for cardio, sports, and strength, with live burn preview and $120\text{-minute}$ safety alerts. | [`ExerciseForm.tsx`](file:///c:/Users/gaura/OneDrive/Desktop/fitness/src/features/exercise-log/components/ExerciseForm.tsx), [`ExerciseLogList.tsx`](file:///c:/Users/gaura/OneDrive/Desktop/fitness/src/features/exercise-log/components/ExerciseLogList.tsx) |
| **Activity Equivalents** | Multi-day pacing tool estimating duration needed across common activities for a given calorie amount (capped at $2,000\text{ kcal}$ / $120\text{ min/day}$). | [`BurnCalculatorScreen.tsx`](file:///c:/Users/gaura/OneDrive/Desktop/fitness/src/features/burn-calculator/components/BurnCalculatorScreen.tsx) |
| **History & Trends** | Interactive Recharts graphs tracking rolling 7, 14, and 30-day intake vs. goal, weight regression trendlines, and weekly consistency streaks. | [`CalorieChart.tsx`](file:///c:/Users/gaura/OneDrive/Desktop/fitness/src/features/history/components/CalorieChart.tsx), [`WeightChart.tsx`](file:///c:/Users/gaura/OneDrive/Desktop/fitness/src/features/history/components/WeightChart.tsx) |
| **Onboarding & Safety Wizard**| 3-step setup calculating BMR & TDEE with Mifflin-St Jeor equations. Hard safety block for users under 18 and calorie floor safeguards. | [`OnboardingScreen.tsx`](file:///c:/Users/gaura/OneDrive/Desktop/fitness/src/features/onboarding/components/OnboardingScreen.tsx) |
| **Profile & Privacy** | Physical metric adjustments, quick weigh-in logger, formula-injection-safe CSV data export, and irreversible account deletion via RPC. | [`ProfileScreen.tsx`](file:///c:/Users/gaura/OneDrive/Desktop/fitness/src/features/profile/components/ProfileScreen.tsx), [`DeleteAccountModal.tsx`](file:///c:/Users/gaura/OneDrive/Desktop/fitness/src/features/profile/components/DeleteAccountModal.tsx) |

---

## Design System & Color Tokens

Our custom design system is specified in [`docs/DESIGN.md`](file:///c:/Users/gaura/OneDrive/Desktop/fitness/docs/DESIGN.md) and applied via CSS variables in [`src/app/globals.css`](file:///c:/Users/gaura/OneDrive/Desktop/fitness/src/app/globals.css):

### Palette Matrix
| Token | Light Value | Dark Value | Cultural Reference / Usage | Contrast Ratio |
|---|---|---|---|---|
| **Neel** (Primary) | `#1D2147` | `#EDEFFA` | Deep indigo ink for headings, primary buttons, and borders | $> 12:1$ (AAA) |
| **Steel** (Page) | `#EDF0F1` | `#12142B` | Polished stainless steel thali backdrop | Base canvas |
| **Plate** (Surface) | `#FAFBFB` | `#1B1E3D` | Crisp porcelain/steel surface cards, sheets, and modals | Container |
| **Haldi** (Turmeric) | `#F2B01E` | `#F2B01E` | Warm golden spice; carbohydrate katori arc & active focus ring | Focus / Accent |
| **Chukandar** (Beetroot) | `#B1275B` | `#F06292` | Deep natural red; protein katori arc & destructive warnings | $> 4.8:1$ (AA) |
| **Patta** (Curry Leaf) | `#327349` | `#4CAF50` | Earthy, grounded green; dietary fat katori arc & success states | $> 4.6:1$ (AA) |

### Typography Scale
- **Headings & Quantitative Figures**: `Bricolage Grotesque` (`--font-heading`).
- **Body & Interface Copy**: `Instrument Sans` (`--font-sans`).
- **Tabular Numerals**: `tabular-nums` applied globally for financial-grade precision across weights, calories, and grams.

### Accessibility Standards
- **WCAG 2.1 AA Compliant**: Audited with `@axe-core/playwright` on all pages with **0 serious or critical violations**.
- **Touch Ergonomics**: All interactive elements (buttons, inputs, selects, tabs) enforce a minimum touch target size of $44\text{px} \times 44\text{px}$.
- **Focus Indicators**: 2px Haldi focus ring (`focus-visible:ring-2 focus-visible:ring-haldi-500`) with inner spacing.
- **Motion Safety**: Respects `prefers-reduced-motion: reduce` across all animations and transitions.

---

## Architecture & Folder Structure

FitCalc enforces a **modular, feature-based architecture**. Code is partitioned by functional domain, with all cross-feature communication routed through public barrel exports (`index.ts`). Internal feature files cannot be imported across feature boundaries (strictly validated via automated architecture tests).

```
fitness/
├── docs/                               # System specifications & visual docs
│   ├── ARCHITECTURE.md                 # Layer boundaries & dependency rules
│   ├── DESIGN.md                       # Comprehensive design system manifesto
│   ├── ENERGY_MODEL.md                 # Scientific metabolic equations & safety rules
│   └── screenshots/                    # Real Playwright screenshot artifacts (light/dark)
├── e2e/                                # Playwright end-to-end test suite
│   ├── 01-unauthenticated.spec.ts      # Landing, login/signup, redirects, API auth
│   ├── 02-authenticated-user-a.spec.ts # Core logging, editing, history, and CSV export
│   ├── 03-privacy-isolation.spec.ts    # Multi-tenant RLS isolation between users
│   └── 04-account-deletion.spec.ts     # User deletion cascade & cleanup
├── src/
│   ├── app/                            # Thin Next.js 16 App Router route wrappers
│   │   ├── (app)/                      # Authenticated shell layout (Dashboard, Logs, History)
│   │   ├── (auth)/                     # Auth shell layout (Login, Signup)
│   │   ├── api/foods/search/           # Debounced food lookup API route
│   │   ├── globals.css                 # Tailwind v4 theme, tokens & utility rules
│   │   └── layout.tsx                  # Root layout, Google fonts, anti-flicker script
│   ├── components/                     # Reusable global component primitives
│   │   ├── layout/                     # AppShell, NavSidebar, BottomTabBar, ThemeToggle
│   │   └── ui/                         # Button, Sheet, Card, Input, NumberInput, Badge...
│   ├── features/                       # Modular feature domains
│   │   ├── auth/                       # Login/Signup forms, hooks, and sessions
│   │   ├── burn-calculator/            # Activity Equivalents duration estimator
│   │   ├── custom-foods/               # Custom dishes and recipe catalog
│   │   ├── dashboard/                  # Thali Plate, net energy banner, meal grids
│   │   ├── exercise-log/               # MET workout tracking, duration edits
│   │   ├── food-log/                   # Daily meal tracker, Sheet search modal
│   │   ├── history/                    # Analytics, Recharts trends, weekly streaks
│   │   ├── landing/                    # Interactive hero Thali demo
│   │   ├── onboarding/                 # 3-step BMR/TDEE setup wizard
│   │   └── profile/                    # Physical statistics, weigh-ins, data export
│   ├── lib/                            # Pure domain logic & utilities
│   │   ├── auth/                       # Safe redirect verification & session validation
│   │   ├── calc/                       # Mifflin-St Jeor, MET burn, macro scaling math
│   │   ├── csv/                        # RFC 4180 CSV serializer with formula escaping
│   │   ├── dates/                      # ISO 8601 string dates & boundary helpers
│   │   ├── errors/                     # Supabase & network error formatters
│   │   └── supabase/                   # Typed SSR & client-side Supabase connections
│   └── types/                          # Database schema types & application interfaces
├── supabase/
│   └── migrations/                     # Numbered PostgreSQL migrations (001 - 010)
├── postcss.config.mjs                  # Tailwind v4 PostCSS configuration
└── tsconfig.json                       # Strict TypeScript configuration
```

---

## Database & Security Model

All persistent data is hosted in **Supabase (PostgreSQL 15)** protected by **Row Level Security (RLS)**. No user can read, query, update, or delete data belonging to another tenant.

### Table Schema Summary
- `profiles`: User biological sex, date of birth, height, current weight, activity level, goal type, and daily calorie target.
- `foods`: Global and seeded food catalog with per-$100\text{g}$ energy, macronutrients, and source attribution (`seed` or `openfoodfacts`).
- `food_logs`: Daily meal logs linked to `auth.users`, storing quantity in grams, scaled calories, and macronutrients.
- `exercises`: Catalog of physical activities with official MET values and intensities.
- `exercise_logs`: Recorded workouts storing duration in minutes and calculated calorie burn.
- `weight_logs`: Historical body weight records for trendline analysis.
- `burn_plans`: Saved multi-day activity equivalent plans.

### Migration Ledger (`supabase/migrations/`)
- `001_initial_schema.sql`: Base tables, foreign keys, and preliminary RLS policies.
- `002_seed.sql`: Seed data for 30 staple Indian foods and 20 common physical activities.
- `003_functions.sql`: Triggers and utility helpers.
- `004_fix_rls.sql`: Hardened user scoping for custom foods.
- `005_fix_date_types.sql`: Standardized all dates to ISO `DATE` type to eliminate timezone drift.
- `006_custom_foods_rls.sql`: Restricted custom food mutations to the creating user.
- `007_burn_reframing.sql`: Cleaned up legacy burn compensation columns and reframed schema.
- `008_delete_my_account.sql`: Secure `SECURITY DEFINER` RPC function cascading user deletion from `auth.users` and clearing all associated records.
- `009_replace_log_policies.sql`: Idempotent script dropping and recreating consolidated policies on `food_logs` and `exercise_logs` to prevent foreign food insertion.
- `010_indexes_and_cleanup.sql`: Composite performance indexes (`user_id, logged_on`) on log tables for instantaneous chart querying.

---

## Quick Start & Setup Guide

### 1. Prerequisites
- **Node.js**: `v20.x` or `v22.x` (LTS)
- **Package Manager**: `npm` (v10+)
- **Supabase Account**: A free Supabase project with PostgreSQL.

### 2. Installation
Clone the repository and install dependencies:
```bash
git clone <repository-url>
cd fitness
npm install
```

### 3. Configure Environment Variables
Create a `.env.local` file in the root directory:
```bash
cp .env.example .env.local
```

Populate the following keys (available in your Supabase Project Settings $\rightarrow$ API):
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

*(Optional: For running live authenticated E2E test flows, populate `.env.e2e` with test credentials)*.

### 4. Apply Database Migrations
Copy and run the contents of [`supabase/ALL_MIGRATIONS.sql`](file:///c:/Users/gaura/OneDrive/Desktop/fitness/supabase/ALL_MIGRATIONS.sql) directly in your Supabase SQL Editor.

### 5. Launch Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Testing & Verification

FitCalc features a rigorous testing pyramid guaranteeing architectural boundaries, calculation correctness, and browser usability.

### 1. Unit & Architecture Suite
Verifies metabolic calculations, CSV sanitization, date boundaries, and architectural module rules:
```bash
npm test
```
*Output: 10 test suites, 100 tests passed.*

### 2. Static Code Analysis (ESLint)
Strict linting enforcing zero unused variables, valid Next.js imports, and accessibility best practices:
```bash
npm run lint
```
*Output: Clean, 0 errors, 0 warnings.*

### 3. Type Checking
Verifies strict TypeScript compliance across all components, API routes, and database queries:
```bash
npx tsc --noEmit
```
*Output: 0 errors.*

### 4. Production Build Verification
Compiles all 15 static and dynamic App Router routes using Next.js Turbopack:
```bash
npm run build
```

### 5. Playwright End-to-End Suite
Drives real Chromium instances testing unauthenticated navigation, authentication loops, private route guards, and API responses:
```bash
npx playwright test
```

---

## Visual Gallery & Screenshots

All screenshots were generated automatically using headless Chromium at mobile ($390\text{px} \times 844\text{px}$) and desktop ($1440\text{px} \times 900\text{px}$) viewports across both light and dark color schemes:

| Page / Screen | Light Mode (Desktop) | Dark Mode (Desktop) |
|---|---|---|
| **Landing Page** | [`landing-light-desktop.png`](file:///c:/Users/gaura/OneDrive/Desktop/fitness/docs/screenshots/landing-light-desktop.png) | [`landing-dark-desktop.png`](file:///c:/Users/gaura/OneDrive/Desktop/fitness/docs/screenshots/landing-dark-desktop.png) |
| **Thali Plate Signature** | [`thali-plate-light-desktop.png`](file:///c:/Users/gaura/OneDrive/Desktop/fitness/docs/screenshots/thali-plate-light-desktop.png) | [`thali-plate-dark-desktop.png`](file:///c:/Users/gaura/OneDrive/Desktop/fitness/docs/screenshots/thali-plate-dark-desktop.png) |
| **Login Screen** | [`login-light-desktop.png`](file:///c:/Users/gaura/OneDrive/Desktop/fitness/docs/screenshots/login-light-desktop.png) | [`login-dark-desktop.png`](file:///c:/Users/gaura/OneDrive/Desktop/fitness/docs/screenshots/login-dark-desktop.png) |
| **Signup Screen** | [`signup-light-desktop.png`](file:///c:/Users/gaura/OneDrive/Desktop/fitness/docs/screenshots/signup-light-desktop.png) | [`signup-dark-desktop.png`](file:///c:/Users/gaura/OneDrive/Desktop/fitness/docs/screenshots/signup-dark-desktop.png) |
| **404 Not Found** | [`notfound-light-desktop.png`](file:///c:/Users/gaura/OneDrive/Desktop/fitness/docs/screenshots/notfound-light-desktop.png) | [`notfound-dark-desktop.png`](file:///c:/Users/gaura/OneDrive/Desktop/fitness/docs/screenshots/notfound-dark-desktop.png) |

*(Mobile viewport screenshots are archived in [`docs/screenshots/`](file:///c:/Users/gaura/OneDrive/Desktop/fitness/docs/screenshots/)).*

---

## Mathematical & Metabolic Formulas

FitCalc implements gold-standard, peer-reviewed metabolic equations:

### 1. Basal Metabolic Rate (BMR) – Mifflin-St Jeor
$$\text{BMR}_{\text{male}} = (10 \times \text{weight in kg}) + (6.25 \times \text{height in cm}) - (5 \times \text{age in years}) + 5$$
$$\text{BMR}_{\text{female}} = (10 \times \text{weight in kg}) + (6.25 \times \text{height in cm}) - (5 \times \text{age in years}) - 161$$

### 2. Total Daily Energy Expenditure (TDEE)
$$\text{TDEE} = \text{BMR} \times \text{Activity Multiplier}$$
- **Sedentary**: $1.2$
- **Lightly Active**: $1.375$
- **Moderately Active**: $1.55$
- **Active**: $1.725$
- **Very Active**: $1.9$

### 3. Physical Activity Expenditure (Compendium of Physical Activities)
$$\text{Calories Burned (kcal)} = \text{MET} \times \text{weight (kg)} \times \left(\frac{\text{duration in minutes}}{60}\right)$$

### 4. Macro Proportion Equations
$$\text{Protein Energy (kcal)} = \text{Protein (g)} \times 4$$
$$\text{Carbohydrate Energy (kcal)} = \text{Carbs (g)} \times 4$$
$$\text{Fat Energy (kcal)} = \text{Fat (g)} \times 9$$

---

## License & Attribution

- **Application Code**: Licensed under the MIT License.
- **Nutritional Data**: Seeded Indian foods are derived from open public nutritional tables. External food search queries are powered by [Open Food Facts](https://world.openfoodfacts.org/) under the [Open Database License (ODbL)](https://opendatacommons.org/licenses/odbl/1-0/).
- **Exercise MET Metrics**: Derived from the *2011/2024 Compendium of Physical Activities* (Ainsworth et al.).
