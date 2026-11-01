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
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">History & Analytics</h1>
          <p className="text-xs text-gray-500 mt-1">
            Review past intake trends, expenditure, and weight progression.
          </p>
        </div>

        {/* Range Selector */}
        <div className="flex items-center gap-1.5 p-1 bg-white border border-gray-200 rounded-2xl shadow-2xs">
          {([7, 14, 30] as DateRange[]).map((r) => (
            <button
              key={r}
              onClick={() => setRangeDays(r)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all ${
                rangeDays === r
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              Last {r} days
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 text-emerald-600 animate-spin" />
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
          <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-gray-900">Daily Intake vs Goal</h2>
                <p className="text-xs text-gray-500">Daily food intake (green) vs target goal (orange) vs burn (red)</p>
              </div>
              <span className="text-xs text-gray-400 italic">*estimated</span>
            </div>

            <CalorieChart data={calorieChartData} />
          </div>

          {/* Two-Column: Weight Progression & Macro Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm space-y-4">
              <div>
                <h2 className="text-base font-bold text-gray-900">Body Weight History</h2>
                <p className="text-xs text-gray-500">Recorded weigh-ins and trendline</p>
              </div>

              {weightChartData.length === 0 ? (
                <div className="text-center py-12 text-gray-400 text-xs">
                  No weigh-ins logged in this timeframe. Log your weight on the Profile page.
                </div>
              ) : (
                <WeightChart data={weightChartData} unit="kg" />
              )}
            </div>

            <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm space-y-4">
              <div>
                <h2 className="text-base font-bold text-gray-900">Macronutrient Split</h2>
                <p className="text-xs text-gray-500">Aggregate protein, carbohydrate, and fat intake</p>
              </div>

              <MacroChart proteinG={totalProtein} carbsG={totalCarbs} fatG={totalFat} />
            </div>
          </div>

          {/* Daily Logs History Breakdown */}
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
