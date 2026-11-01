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
  changeDate: (days: number) => void;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
}

export function FoodLogDateBar({
  loggedOn,
  setLoggedOn,
  changeDate,
  totalCalories,
  totalProtein,
  totalCarbs,
  totalFat,
}: FoodLogDateBarProps) {
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

      <div className="flex items-center gap-3 text-xs font-medium text-ink/70">
        <div className="bg-steel-100 px-3 py-1.5 rounded-xl border border-steel-200 text-ink font-bold tabular-nums">
          {totalCalories} kcal total
        </div>
        <div className="hidden sm:flex items-center gap-3 tabular-nums">
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-chukandar-500" />
            P: <strong className="text-ink">{totalProtein}g</strong>
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-haldi-500" />
            C: <strong className="text-ink">{totalCarbs}g</strong>
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-patta-500" />
            F: <strong className="text-ink">{totalFat}g</strong>
          </span>
        </div>
      </div>
    </div>
  );
}
