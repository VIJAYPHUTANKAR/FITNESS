# Refactoring Observations & Notes

This document catalogues code smells, architectural anomalies, assumptions, and design decisions recorded during the structural refactor of the FitCalc project.

---

## 1. Observations & Code Smells (Unmodified to Preserve Strict Behavioral Invariance)

1. **Client Component Trace in Next.js Route Handlers**:
   - In Next.js 15 with Turbopack, route handlers (`src/app/api/foods/search/route.ts`) operate in a pure server context. If an API route imports from `@/features/food-log` (`index.ts`) while that barrel file also re-exports a Client Component (e.g., `FoodLogScreen`), Turbopack analyzes the client component graph and throws a compile error (`Client Component Browser in App Route`).
   - *Design Choice*: The hooks and client subcomponents were explicitly annotated with `'use client';` so that Next.js treats their dependencies appropriately when referenced via feature exports.

2. **Server-Side Fallback Rate Limiter in Route Handlers**:
   - The food search route handler (`src/app/api/foods/search/route.ts`) includes an in-memory `Map` rate limiter. In multi-instance serverless deployments (such as Vercel or AWS Lambda), memory is not shared across instances. This in-memory limiter acts as an instance-level throttle rather than a distributed rate limiter. For production scale, an external store (Upstash Redis) is standard.

3. **Open Food Facts API Network Latency & Fallback**:
   - When searching foods, queries with fewer than 8 local database results reach out to `world.openfoodfacts.org` with a 2.5s abort timeout. While safe and non-blocking, under poor connectivity this can introduce a brief UI search debounce delay.

4. **Next.js 16 Canary Deprecation Notice**:
   - Next.js Turbopack logs a warning: `The "middleware" file convention is deprecated. Please use "proxy" instead`. Because the project is pinned to Next.js 15/16 App Router conventions and `src/middleware.ts` functions correctly without regressions, it was preserved as-is.

---

## 2. Assumptions

1. **Feature Scope & Public Boundaries**:
   - Assumed features are the primary architectural units (`auth`, `onboarding`, `dashboard`, `food-log`, `exercise-log`, `burn-calculator`, `history`, `custom-foods`, `profile`). Any file residing inside one feature should never deep-import internal files from another feature.
   - Enforced this strictly using an automated Jest unit test (`src/__tests__/architecture.test.ts`).

2. **Server vs. Client Responsibilities in `src/app`**:
   - The Dashboard page (`src/app/(app)/dashboard/page.tsx`) executes an initial server-side query to pre-populate dashboard data and avoids client-side waterfall spinners on load. The other pages render client screens that fetch user-specific state via Supabase browser client with live local state management.

3. **Maximum File Size Ceiling**:
   - Enforced a hard limit of 250 lines for any code file in `src/`. All decomposed files in this refactor are strictly under 250 lines (with the largest being 248 lines).

---

## 3. Design Decisions

1. **Modular Shared Libraries (`src/lib/`)**:
   - Distributed monolithic `utils.ts` into single-responsibility modules:
     - `src/lib/dates`: Date arithmetic and ISO string formatting.
     - `src/lib/errors`: Supabase error sanitization.
     - `src/lib/ui`: Tailwind class merge (`cn`).
     - `src/lib/csv`: Neutralized CSV generation.
   - Removed `utils.ts` to prevent "grab bag" utility anti-patterns.

2. **Clean Route Layer (`src/app/`)**:
   - Reduced all 10 page files in `src/app/(app)/` and `src/app/(auth)/` to 4-14 lines each, serving purely as route definitions that render self-contained feature screens.
