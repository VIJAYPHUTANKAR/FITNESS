/**
 * DailyBreakdownAccordion: Collapsible day-by-day activity log showing food items and exercises.
 * Rendered inside HistoryScreen.
 */

'use client';

import { ChevronDown, ChevronUp } from 'lucide-react';
import { formatDate } from '@/lib/dates';
import type { FoodLog, ExerciseLog } from '@/types/database';

interface DailyBreakdownAccordionProps {
  daysList: string[];
  foodLogs: FoodLog[];
  exerciseLogs: ExerciseLog[];
  expandedDay: string | null;
  setExpandedDay: (day: string | null) => void;
}

export function DailyBreakdownAccordion({
  daysList,
  foodLogs,
  exerciseLogs,
  expandedDay,
  setExpandedDay,
}: DailyBreakdownAccordionProps) {
  return (
    <div className="bg-plate rounded-2xl border border-steel-200/80 p-6 shadow-xs space-y-4">
      <h2 className="text-base font-heading font-semibold text-ink">Daily Activity Breakdown</h2>

      <div className="divide-y divide-steel-100">
        {daysList.map((iso) => {
          const dayFoods = foodLogs.filter((f) => f.logged_on === iso);
          const dayExercises = exerciseLogs.filter((e) => e.logged_on === iso);
          const isExpanded = expandedDay === iso;

          const calsIn = Math.round(dayFoods.reduce((acc, curr) => acc + Number(curr.calories), 0));
          const calsOut = Math.round(dayExercises.reduce((acc, curr) => acc + Number(curr.calories_burned), 0));

          if (dayFoods.length === 0 && dayExercises.length === 0) {
            return (
              <div key={iso} className="py-2.5 flex items-center justify-between text-xs text-ink/40">
                <span>{formatDate(iso)}</span>
                <span>No entries logged</span>
              </div>
            );
          }

          return (
            <div key={iso} className="py-3">
              <button
                onClick={() => setExpandedDay(isExpanded ? null : iso)}
                className="w-full flex items-center justify-between text-left hover:text-ink transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-ink">{formatDate(iso)}</span>
                  <span className="text-xs text-ink/60">
                    {dayFoods.length} foods • {dayExercises.length} workouts
                  </span>
                </div>
                <div className="flex items-center gap-4 tabular-nums">
                  <span className="text-xs font-bold text-patta-700">+{calsIn} kcal</span>
                  {calsOut > 0 && <span className="text-xs font-bold text-haldi-700">-{calsOut} kcal</span>}
                  {isExpanded ? <ChevronUp className="h-4 w-4 text-ink/40" /> : <ChevronDown className="h-4 w-4 text-ink/40" />}
                </div>
              </button>

              {isExpanded && (
                <div className="mt-3 pl-3 border-l-2 border-haldi-400 space-y-2 text-xs">
                  {dayFoods.length > 0 && (
                    <div>
                      <span className="font-semibold text-ink/80 block mb-1">Foods:</span>
                      <ul className="space-y-1">
                        {dayFoods.map((f) => (
                          <li key={f.id} className="flex justify-between text-ink/70">
                            <span>{f.food_name} ({f.quantity_grams}g)</span>
                            <span className="font-medium text-ink tabular-nums">{Math.round(Number(f.calories))} kcal</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {dayExercises.length > 0 && (
                    <div className="pt-1">
                      <span className="font-semibold text-ink/80 block mb-1">Workouts:</span>
                      <ul className="space-y-1">
                        {dayExercises.map((e) => (
                          <li key={e.id} className="flex justify-between text-ink/70">
                            <span>{e.exercise_name} ({e.duration_min} min)</span>
                            <span className="font-medium text-haldi-800 tabular-nums">-{Math.round(Number(e.calories_burned))} kcal</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
