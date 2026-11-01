/**
 * HistoryStatsGrid: Metric cards for average intake, workout volume, logging consistency, and streak.
 * Rendered inside HistoryScreen.
 */

'use client';

import WeeklyStreak from './WeeklyStreak';

interface HistoryStatsGridProps {
  avgCaloriesPerLoggedDay: number;
  exerciseLogsCount: number;
  totalBurnedPeriod: number;
  loggedDaysCount: number;
  rangeDays: number;
  loggedDates: string[];
}

export function HistoryStatsGrid({
  avgCaloriesPerLoggedDay,
  exerciseLogsCount,
  totalBurnedPeriod,
  loggedDaysCount,
  rangeDays,
  loggedDates,
}: HistoryStatsGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-1">
        <span className="text-[11px] font-semibold text-gray-400 uppercase">Avg Daily Intake</span>
        <p className="text-2xl font-bold text-gray-900">
          {avgCaloriesPerLoggedDay} <span className="text-xs font-normal text-gray-500">kcal</span>
        </p>
        <p className="text-[10px] text-gray-400">on days with logs</p>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-1">
        <span className="text-[11px] font-semibold text-gray-400 uppercase">Total Workouts</span>
        <p className="text-2xl font-bold text-orange-600">
          {exerciseLogsCount} <span className="text-xs font-normal text-gray-500">sessions</span>
        </p>
        <p className="text-[10px] text-gray-400">{totalBurnedPeriod} kcal burned</p>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-1">
        <span className="text-[11px] font-semibold text-gray-400 uppercase">Consistency</span>
        <p className="text-2xl font-bold text-emerald-600">
          {Math.round((loggedDaysCount / rangeDays) * 100)}%
        </p>
        <p className="text-[10px] text-gray-400">{loggedDaysCount} of {rangeDays} days logged</p>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-2">
        <span className="text-[11px] font-semibold text-gray-400 uppercase">Current Streak</span>
        <WeeklyStreak loggedDates={loggedDates} />
      </div>
    </div>
  );
}
