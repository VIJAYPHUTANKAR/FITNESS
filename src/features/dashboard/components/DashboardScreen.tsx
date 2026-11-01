/**
 * DashboardScreen: Main dashboard view showing daily calorie ring, macro distribution,
 * net energy calculation, quick summary metrics, and meal breakdown for today.
 * Rendered by src/app/(app)/dashboard/page.tsx.
 */

import Link from 'next/link';
import { formatDate } from '@/lib/dates';
import { CalorieRing } from './CalorieRing';
import { MacroBar } from './MacroBar';
import { DailySummaryCard } from './DailySummaryCard';
import { NetEnergyBanner } from './NetEnergyBanner';
import { MealsSummaryGrid } from './MealsSummaryGrid';
import {
  Utensils,
  Flame,
  Activity,
  Target,
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
    netCalories,
    goal,
    proteinG,
    carbsG,
    fatG,
    needsOnboarding,
  } = metrics;

  return (
    <div className="mx-auto max-w-5xl p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Onboarding Banner if profile incomplete */}
      {needsOnboarding && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-amber-50 border border-amber-200">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-amber-900">Complete your profile for personalised goals</p>
              <p className="text-xs text-amber-700">Set your weight, height, and activity level to compute accurate BMR, TDEE, and burn targets.</p>
            </div>
          </div>
          <Link
            href="/onboarding"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-xl transition-colors shrink-0"
          >
            Start Setup <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">Today&apos;s Overview</h1>
          <p className="text-sm text-gray-500 mt-1">{formatDate(today)} • All values are estimated</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/log/food"
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-sm active:scale-95"
          >
            <Plus className="h-4 w-4" /> Log Food
          </Link>
          <Link
            href="/log/exercise"
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl transition-all shadow-sm active:scale-95"
          >
            <Activity className="h-4 w-4 text-emerald-600" /> Log Workout
          </Link>
        </div>
      </div>

      {/* Hero Stats Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
        {/* Calorie Ring */}
        <div className="flex flex-col items-center justify-center p-2 lg:border-r border-gray-100">
          <CalorieRing caloriesIn={caloriesIn} goal={goal} size={200} />
          <p className="text-xs text-gray-400 mt-2 font-medium">Daily budget: {goal} kcal</p>
        </div>

        {/* Macros & Net Energy */}
        <div className="flex flex-col justify-center space-y-4 lg:col-span-2">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Macronutrients</h2>
            <p className="text-xs text-gray-500">Distribution of today&apos;s logged calories</p>
          </div>
          <MacroBar proteinG={proteinG} carbsG={carbsG} fatG={fatG} />

          {/* Net Energy Banner */}
          <NetEnergyBanner metrics={metrics} />
        </div>
      </div>

      {/* Quick Summary Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <DailySummaryCard
          icon={Utensils}
          label="Calories In"
          value={caloriesIn}
          unit="kcal"
          variant="emerald"
        />
        <DailySummaryCard
          icon={Activity}
          label="Burned (Exercise)"
          value={caloriesOut}
          unit="kcal"
          variant="orange"
        />
        <DailySummaryCard
          icon={Flame}
          label="Net Calories"
          value={netCalories}
          unit="kcal"
          variant={netCalories > goal ? 'red' : 'default'}
        />
        <DailySummaryCard
          icon={Target}
          label="Daily Goal"
          value={goal}
          unit="kcal"
          variant="default"
        />
      </div>

      {/* Meals of Today */}
      <MealsSummaryGrid logs={foodLogs} />
    </div>
  );
}
