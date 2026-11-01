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
        <div className="bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100 text-emerald-800 font-bold">
          {totalCalories} kcal total
        </div>
        <div className="hidden sm:flex items-center gap-3 text-gray-500">
          <span>P: <strong className="text-gray-800">{totalProtein}g</strong></span>
          <span>C: <strong className="text-gray-800">{totalCarbs}g</strong></span>
          <span>F: <strong className="text-gray-800">{totalFat}g</strong></span>
        </div>
      </div>
    </div>
  );
}
