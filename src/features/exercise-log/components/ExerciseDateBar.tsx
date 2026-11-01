'use client';

/**
 * ExerciseDateBar: Date selector and daily burned calories / duration summary header.
 * Rendered inside ExerciseLogScreen.
 */

import { Calendar, ChevronLeft, ChevronRight, Flame } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { todayISO } from '@/lib/dates';

interface ExerciseDateBarProps {
  loggedOn: string;
  setLoggedOn: (date: string) => void;
  changeDate: (days: number) => void;
  totalBurned: number;
  totalMinutes: number;
}

export function ExerciseDateBar({
  loggedOn,
  setLoggedOn,
  changeDate,
  totalBurned,
  totalMinutes,
}: ExerciseDateBarProps) {
  const isToday = loggedOn === todayISO();

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-plate p-4 rounded-2xl border border-steel-200/80 shadow-xs">
      <div className="flex items-center gap-2">
        <Button variant="quiet" size="sm" onClick={() => changeDate(-1)} aria-label="Previous day">
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-steel-100/60 border border-steel-200 text-ink">
          <Calendar className="h-4 w-4 text-haldi-600" />
          <input
            type="date"
            value={loggedOn}
            onChange={(e) => e.target.value && setLoggedOn(e.target.value)}
            className="text-sm font-medium text-ink bg-transparent focus:outline-none"
          />
        </div>
        <Button variant="quiet" size="sm" onClick={() => changeDate(1)} aria-label="Next day">
          <ChevronRight className="h-4 w-4" />
        </Button>
        {!isToday && (
          <button
            type="button"
            onClick={() => setLoggedOn(todayISO())}
            className="text-xs font-semibold text-haldi-700 hover:underline ml-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-haldi-500 rounded"
          >
            Today
          </button>
        )}
      </div>

      <div className="flex items-center gap-4 text-xs font-medium text-ink/70">
        <div className="flex items-center gap-1 bg-haldi-100/60 px-3 py-1.5 rounded-xl border border-haldi-200 text-ink font-bold tabular-nums">
          <Flame className="h-3.5 w-3.5 text-haldi-600" />
          {totalBurned} kcal burned
        </div>
        <div className="text-ink/60 tabular-nums">
          Duration: <strong className="text-ink">{totalMinutes} min</strong>
        </div>
      </div>
    </div>
  );
}
