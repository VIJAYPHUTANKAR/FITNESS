'use client';

/**
 * FoodLogDateBar: Date selector and quick macro totals badge for the food log page.
 * Rendered inside FoodLogScreen.
 */

import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { todayISO } from '@/lib/dates';

interface FoodLogDateBarProps {
  loggedOn: string;
  setLoggedOn: (date: string) => void;
  dayTotals: {
    calories: number;
    proteinG: number;
    carbsG: number;
    fatG: number;
  };
  onPrevDay: () => void;
  onNextDay: () => void;
}

export function FoodLogDateBar({
  loggedOn,
  setLoggedOn,
  dayTotals,
  onPrevDay,
  onNextDay,
}: FoodLogDateBarProps) {
  const isToday = loggedOn === todayISO();

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onPrevDay}
          aria-label="Previous day"
          className="p-1 h-8 w-8"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-2 font-semibold text-slate-800">
          <Calendar className="h-4 w-4 text-emerald-600" />
          <input
            type="date"
            value={loggedOn}
            onChange={(e) => e.target.value && setLoggedOn(e.target.value)}
            className="border-none bg-transparent font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 rounded px-1"
          />
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onNextDay}
          aria-label="Next day"
          className="p-1 h-8 w-8"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
        {!isToday && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLoggedOn(todayISO())}
            className="text-xs text-emerald-600 hover:text-emerald-700 font-medium"
          >
            Today
          </Button>
        )}
      </div>

      <div className="flex items-center gap-4 text-xs font-medium text-slate-500 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
        <span>Total: <strong className="text-slate-800 font-bold">{dayTotals.calories}</strong> kcal</span>
        <span>P: <strong className="text-slate-800">{dayTotals.proteinG}g</strong></span>
        <span>C: <strong className="text-slate-800">{dayTotals.carbsG}g</strong></span>
        <span>F: <strong className="text-slate-800">{dayTotals.fatG}g</strong></span>
      </div>
    </div>
  );
}
