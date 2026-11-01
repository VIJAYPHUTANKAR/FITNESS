# Architecture and Code Review Notes

This directory contains external review documents and audit trail reports for the fitness application.

## Overview of Completed Reviews & Audits

1. **Security & Database Hardening Audit**
   - Verified RLS policies across all tables (`profiles`, `foods`, `food_logs`, `exercises`, `exercise_logs`, `weight_logs`, `burn_plans`).
   - Hardened `handle_new_user()` trigger function with `security definer` and fixed `search_path = public`.
   - Hardened redirect safety against open redirect vectors in auth flows.

2. **Activity Equivalents & Energy Model Reframe**
   - Reframed the burn calculator into activity equivalents for neutral, non-compensatory energy expenditure tracking.
   - Removed compensatory terminology and enforced safety caps on daily activity durations and energy values.

3. **Modular Architecture Refactoring**
   - Reorganized monolithic and scattered components into self-contained feature modules under `src/features/`.
   - Separated presentation, state/hooks, services, and types per domain.
