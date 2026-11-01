/**
 * HistoryScreen: Analytics and progress screen showing 7/14/30-day trends, intake vs goal chart,
 * weight progression, macro split, and itemized day-by-day logs. Rendered by src/app/(app)/history/page.tsx.
 */

'use client';

import { Loader2 } from 'lucide-react';
import CalorieChart from './CalorieChart';
import WeightChart from './WeightChart';
import MacroChart from './MacroChart';
import { HistoryStatsGrid } from './HistoryStatsGrid';
import { DailyBreakdownAccordion } from './DailyBreakdownAccordion';
import { useHistory } from '../hooks/useHistory';
import type { DateRange } from '../types';

export function HistoryScreen() {
  const {
    rangeDays,
    setRangeDays,
    loading,
    foodLogs,
    exerciseLogs,
    daysList,
    expandedDay,
    setExpandedDay,
    calorieChartData,
    weightChartData,
    totalProtein,
    totalCarbs,
    totalFat,
    loggedDates,
    loggedDaysCount,
    avgCaloriesPerLoggedDay,
    totalBurnedPeriod,
  } = useHistory();

  return (
    <div className="mx-auto max-w-5xl p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header and Filter */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-ink">History & Analytics</h1>
          <p className="text-xs text-ink/60 mt-1">
            Review past intake trends, expenditure, and weight progression.
          </p>
        </div>

        {/* Range Selector */}
        <div className="flex items-center gap-1 p-1 bg-plate border border-steel-200 rounded-xl shadow-2xs">
          {([7, 14, 30] as DateRange[]).map((r) => (
            <button
              key={r}
              onClick={() => setRangeDays(r)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                rangeDays === r
                  ? 'bg-neel-700 text-white shadow-xs'
                  : 'text-ink/70 hover:text-ink hover:bg-steel-100'
              }`}
            >
              Last {r} days
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 text-haldi-600 animate-spin" />
        </div>
      ) : (
        <>
          {/* Top Quick Stats Grid */}
          <HistoryStatsGrid
            avgCaloriesPerLoggedDay={avgCaloriesPerLoggedDay}
            exerciseLogsCount={exerciseLogs.length}
            totalBurnedPeriod={totalBurnedPeriod}
            loggedDaysCount={loggedDaysCount}
            rangeDays={rangeDays}
            loggedDates={loggedDates}
          />

          {/* Calorie Trend Chart */}
          <div className="bg-plate rounded-2xl border border-steel-200/80 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-heading font-semibold text-ink">Daily Intake vs Goal</h2>
                <p className="text-xs text-ink/60">Daily food intake (curry leaf) vs target goal (turmeric) vs burn (beetroot)</p>
              </div>
              <span className="text-xs text-ink/40 italic">*estimated</span>
            </div>

            <CalorieChart data={calorieChartData} />
          </div>

          {/* Two-Column: Weight Progression & Macro Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-plate rounded-2xl border border-steel-200/80 p-6 shadow-xs space-y-4">
              <div>
                <h2 className="text-base font-heading font-semibold text-ink">Body Weight History</h2>
                <p className="text-xs text-ink/60">Log scale progression with regression trendline</p>
              </div>

              <WeightChart data={weightChartData} />
            </div>

            <div className="bg-plate rounded-2xl border border-steel-200/80 p-6 shadow-xs space-y-4">
              <div>
                <h2 className="text-base font-heading font-semibold text-ink">Macronutrient Split</h2>
                <p className="text-xs text-ink/60">Relative ratio of protein, carbohydrates, and fats</p>
              </div>

              <MacroChart
                proteinG={totalProtein}
                carbsG={totalCarbs}
                fatG={totalFat}
              />
            </div>
          </div>

          {/* Day-by-day itemized logs breakdown */}
          <DailyBreakdownAccordion
            daysList={daysList}
            foodLogs={foodLogs}
            exerciseLogs={exerciseLogs}
            expandedDay={expandedDay}
            setExpandedDay={setExpandedDay}
          />
        </>
      )}
    </div>
  );
}
