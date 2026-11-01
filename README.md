# FitCalc – Fitness Calorie Tracker

A full-stack web app to log food intake, track calories, and get personalised exercise burn recommendations.

> ⚠️ **Disclaimer**: All calorie and exercise values are *estimates*. This app is for informational purposes only and is **not medical advice**. Consult a qualified health professional before making significant changes to your diet or exercise routine.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15 (App Router) + TypeScript |
| Styling | Tailwind CSS v4 |
| Backend / DB | Supabase (Postgres + Auth + RLS) |
| Charts | Recharts |
| Forms | React Hook Form + Zod |
| Food data | Open Food Facts API + curated Indian food database |

## Quick Start

### 1. Clone and install

```bash
git clone <repo>
cd fitness
npm install
```

### 2. Configure environment

```bash
cp .env.local.example .env.local
# Edit .env.local with your Supabase URL and anon key
```

### 3. Set up the database

In your Supabase project's SQL editor, run these migrations **in order**:

```
supabase/migrations/001_initial_schema.sql   ← tables + RLS + trigger
supabase/migrations/002_seed.sql             ← exercises + common foods
supabase/migrations/003_views.sql            ← daily_summary view
```

### 4. Run locally

```bash
npm run dev
# Open http://localhost:3000
```

### 5. Run unit tests

```bash
npm test
```

## Project Structure

```
src/
├── app/
│   ├── (auth)/           # login, signup (no navbar)
│   ├── (app)/            # protected pages (with navbar)
│   │   ├── dashboard/
│   │   ├── log/food/
│   │   ├── log/exercise/
│   │   ├── burn-calculator/
│   │   ├── history/
│   │   ├── onboarding/
│   │   ├── foods/custom/
│   │   └── profile/
│   └── api/foods/search/ # food search proxy
├── components/           # reusable UI components
├── lib/
│   ├── calc/             # pure calc functions (unit tested)
│   │   ├── bmr.ts        # BMR, TDEE, calorie goal
│   │   ├── burn.ts       # MET burn calculator
│   │   └── macros.ts     # macro scaling and recommendations
│   ├── supabase/         # Supabase clients
│   └── utils.ts
└── types/database.ts     # Supabase type definitions
```

## Key Formulas

### BMR (Mifflin-St Jeor)
```
Male:   BMR = 10×kg + 6.25×cm − 5×age + 5
Female: BMR = 10×kg + 6.25×cm − 5×age − 161
TDEE    = BMR × activity multiplier
```

### Exercise burn (MET method)
```
duration_hours = calories_to_burn / (MET × weight_kg)
```

### Fat equivalent
```
calories / 7700 ≈ kg of body fat (rough approximation)
```

## Security

- Row Level Security (RLS) enabled on **all** tables
- Users can only read/write their own data
- Global foods are read-only for all authenticated users
- Service role key is **never** exposed to the frontend
- All inputs validated with Zod

## Calorie Goal Safety

- Minimum floor: 1,200 kcal/day (women), 1,500 kcal/day (men)
- Burn calculator warns when daily exercise time > 120 min
- Always recommends spreading large deficits over multiple days
- Fat equivalent shown for context ("this is not a one-day fix")

## Deploy

1. Push to GitHub
2. Import into [Vercel](https://vercel.com) → add env vars
3. Done. Supabase is already cloud-hosted.

## Contributing

See `CONTRIBUTING.md`. All calorie math changes **must** come with unit tests.
