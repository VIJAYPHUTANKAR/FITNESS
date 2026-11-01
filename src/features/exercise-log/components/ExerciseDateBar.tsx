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
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={() => changeDate(-1)} aria-label="Previous day">
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gray-50 border border-gray-200">
          <Calendar className="h-4 w-4 text-emerald-600" />
          <input
            type="date"
            value={loggedOn}
            onChange={(e) => e.target.value && setLoggedOn(e.target.value)}
            className="text-sm font-semibold text-gray-800 bg-transparent focus:outline-none"
          />
        </div>
        <Button variant="ghost" size="sm" onClick={() => changeDate(1)} aria-label="Next day">
          <ChevronRight className="h-5 w-5" />
        </Button>
        {!isToday && (
          <button
            type="button"
            onClick={() => setLoggedOn(todayISO())}
            className="text-xs font-semibold text-emerald-600 hover:underline ml-1"
          >
            Today
          </button>
        )}
      </div>

      <div className="flex items-center gap-4 text-xs font-medium text-gray-600">
        <div className="flex items-center gap-1 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-100 text-amber-800 font-bold">
          <Flame className="h-3.5 w-3.5" />
          {totalBurned} kcal burned
        </div>
        <div className="text-gray-500">
          Duration: <strong className="text-gray-800">{totalMinutes} min</strong>
        </div>
      </div>
    </div>
  );
}
