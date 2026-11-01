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
      <div className="bg-plate p-4 rounded-2xl border border-steel-200/80 shadow-xs space-y-1">
        <span className="text-[11px] font-semibold text-ink/50 uppercase tracking-wider">Avg Daily Intake</span>
        <p className="text-2xl font-heading font-bold text-ink tabular-nums">
          {avgCaloriesPerLoggedDay} <span className="text-xs font-normal text-ink/60">kcal</span>
        </p>
        <p className="text-[10px] text-ink/40">on days with logs</p>
      </div>

      <div className="bg-plate p-4 rounded-2xl border border-steel-200/80 shadow-xs space-y-1">
        <span className="text-[11px] font-semibold text-ink/50 uppercase tracking-wider">Total Workouts</span>
        <p className="text-2xl font-heading font-bold text-ink tabular-nums">
          {exerciseLogsCount} <span className="text-xs font-normal text-ink/60">sessions</span>
        </p>
        <p className="text-[10px] text-ink/50 tabular-nums">{totalBurnedPeriod} kcal burned</p>
      </div>

      <div className="bg-plate p-4 rounded-2xl border border-steel-200/80 shadow-xs space-y-1">
        <span className="text-[11px] font-semibold text-ink/50 uppercase tracking-wider">Consistency</span>
        <p className="text-2xl font-heading font-bold text-ink tabular-nums">
          {Math.round((loggedDaysCount / rangeDays) * 100)}%
        </p>
        <p className="text-[10px] text-ink/50 tabular-nums">{loggedDaysCount} of {rangeDays} days logged</p>
      </div>

      <div className="bg-plate p-4 rounded-2xl border border-steel-200/80 shadow-xs space-y-2">
        <span className="text-[11px] font-semibold text-ink/50 uppercase tracking-wider">Current Streak</span>
        <WeeklyStreak loggedDates={loggedDates} />
      </div>
    </div>
  );
}
