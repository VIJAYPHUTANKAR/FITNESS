/**
 * ExerciseDateBar: Date selector and daily burned calories / duration summary header.
 * Rendered inside ExerciseLogScreen.
 */

'use client';

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
        <Button variant="ghost" size="sm" onClick={() => changeDate(-1)}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gray-50 border border-gray-200">
          <Calendar className="h-4 w-4 text-emerald-600" />
          <input
            type="date"
            value={loggedOn}
            onChange={(e) => setLoggedOn(e.target.value)}
            className="text-sm font-semibold text-gray-800 bg-transparent focus:outline-none"
          />
        </div>
        <Button variant="ghost" size="sm" onClick={() => changeDate(1)}>
          <ChevronRight className="h-5 w-5" />
        </Button>
        {!isToday && (
          <button
            onClick={() => setLoggedOn(todayISO())}
            className="text-xs font-semibold text-emerald-600 hover:underline ml-1"
          >
            Today
          </button>
        )}
      </div>

      <div className="flex items-center gap-3 text-xs font-medium">
        <span className="bg-orange-50 border border-orange-200 text-orange-700 px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5">
          <Flame className="h-4 w-4 text-orange-500" /> {totalBurned} kcal burned
        </span>
        <span className="text-gray-500 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100">
          {totalMinutes} min total
        </span>
      </div>
    </div>
  );
}
