'use client';

import Link from 'next/link';
import { formatDate } from '@/lib/dates';
import { ThaliPlate } from './ThaliPlate';
import { NetEnergyBanner } from './NetEnergyBanner';
import { MealsSummaryGrid } from './MealsSummaryGrid';
import {
  Activity,
  Plus,
  AlertCircle,
  ChevronRight,
} from 'lucide-react';
import type { DashboardData } from '../types';

interface DashboardScreenProps {
  data: DashboardData;
}

export function DashboardScreen({ data }: DashboardScreenProps) {
  const { foodLogs, today, metrics } = data;
  const {
    caloriesIn,
    caloriesOut,
    goal,
    proteinG,
    carbsG,
    fatG,
    needsOnboarding,
  } = metrics;

  return (
    <div className="mx-auto max-w-5xl p-4 sm:p-6 lg:p-8 space-y-6 text-[var(--color-neel)]">
      {/* Onboarding Banner if profile incomplete */}
      {needsOnboarding && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-[16px] bg-[var(--color-haldi-subtle)] border border-[var(--color-haldi)]/40 text-left">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-[#7A4B00] dark:text-[#F7C966] shrink-0" />
            <div>
              <p className="text-sm font-bold text-[#7A4B00] dark:text-[#F7C966]">
                Complete your profile for personalized targets
              </p>
              <p className="text-xs text-[var(--color-neel-muted)]">
                Set height, weight, and lifestyle activity to calculate accurate BMR and safe calorie goals.
              </p>
            </div>
          </div>
          <Link
            href="/onboarding"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-[10px] bg-[var(--color-neel)] text-[var(--color-plate)] dark:text-[#12142B] hover:opacity-90 transition-opacity shrink-0 min-h-[44px]"
          >
            Start setup <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      )}

      {/* Header & Date Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--color-border-subtle)] text-left">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-[var(--color-neel)]">
            Today&apos;s nutrition
          </h1>
          <p className="text-xs text-[var(--color-neel-muted)] mt-0.5">
            {formatDate(today)} · Daily Goal: <strong className="text-[var(--color-neel)] font-bold">{goal} kcal</strong> · All values are estimated
          </p>
        </div>

        {/* Quick action buttons */}
        <div className="flex items-center gap-2">
          <Link
            href="/log/food"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-[10px] bg-[var(--color-neel)] text-[var(--color-plate)] dark:text-[#12142B] hover:opacity-90 transition-opacity shadow-xs min-h-[44px]"
          >
            <Plus className="h-3.5 w-3.5" /> Add food
          </Link>
          <Link
            href="/log/exercise"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-[10px] bg-[var(--color-plate)] text-[var(--color-neel)] border border-[var(--color-border)] hover:bg-[var(--color-steel)] transition-colors min-h-[44px]"
          >
            <Activity className="h-3.5 w-3.5" /> Log activity
          </Link>
        </div>
      </div>

      {/* Main Grid: Desktop 2-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Thali Plate + Net Energy */}
        <div className="lg:col-span-5 space-y-4">
          <ThaliPlate
            caloriesIn={caloriesIn}
            goal={goal}
            proteinG={proteinG}
            carbsG={carbsG}
            fatG={fatG}
          />
          <NetEnergyBanner metrics={metrics} />
        </div>

        {/* Right Column: Meals List */}
        <div className="lg:col-span-7 space-y-6">
          <MealsSummaryGrid logs={foodLogs} />

          {/* Quick summary strip */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-center">
            <div className="p-3.5 rounded-[12px] bg-[var(--color-plate)] border border-[var(--color-border)]">
              <span className="text-[10px] font-semibold text-[var(--color-neel-muted)] uppercase tracking-wider">
                Total Intake
              </span>
              <p className="font-heading font-extrabold text-lg text-[var(--color-neel)] tabular-nums mt-0.5">
                {caloriesIn} <span className="text-xs font-normal text-[var(--color-neel-muted)]">kcal</span>
              </p>
            </div>

            <div className="p-3.5 rounded-[12px] bg-[var(--color-plate)] border border-[var(--color-border)]">
              <span className="text-[10px] font-semibold text-[var(--color-neel-muted)] uppercase tracking-wider">
                Activity Burn
              </span>
              <p className="font-heading font-extrabold text-lg text-[var(--color-neel)] tabular-nums mt-0.5">
                {caloriesOut} <span className="text-xs font-normal text-[var(--color-neel-muted)]">kcal</span>
              </p>
            </div>

            <div className="col-span-2 sm:col-span-1 p-3.5 rounded-[12px] bg-[var(--color-plate)] border border-[var(--color-border)]">
              <span className="text-[10px] font-semibold text-[var(--color-neel-muted)] uppercase tracking-wider">
                Daily Budget
              </span>
              <p className="font-heading font-extrabold text-lg text-[var(--color-neel)] tabular-nums mt-0.5">
                {goal} <span className="text-xs font-normal text-[var(--color-neel-muted)]">kcal</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
