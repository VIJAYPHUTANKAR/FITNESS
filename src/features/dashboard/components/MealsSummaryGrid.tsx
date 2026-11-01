/**
 * MealsSummaryGrid: Renders cards for each meal section (Breakfast, Lunch, Dinner, Snacks)
 * with itemized logged entries and calories. Rendered inside DashboardScreen.
 */

import Link from 'next/link';
import type { FoodLog } from '@/types/database';

interface MealsSummaryGridProps {
  logs: FoodLog[];
}

const MEAL_SECTIONS = [
  { type: 'breakfast', title: 'Breakfast', icon: '🌅' },
  { type: 'lunch', title: 'Lunch', icon: '☀️' },
  { type: 'dinner', title: 'Dinner', icon: '🌙' },
  { type: 'snack', title: 'Snacks', icon: '🍎' },
] as const;

export function MealsSummaryGrid({ logs }: MealsSummaryGridProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900">Meals Logged Today</h2>
        <Link href="/log/food" className="text-xs font-semibold text-emerald-600 hover:text-emerald-700">
          View all / edit →
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {MEAL_SECTIONS.map(({ type, title, icon }) => {
          const mealItems = logs.filter((item) => item.meal_type === type);
          const mealCals = Math.round(mealItems.reduce((acc, curr) => acc + Number(curr.calories), 0));

          return (
            <div key={type} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{icon}</span>
                  <span className="font-semibold text-gray-900 text-sm">{title}</span>
                </div>
                <span className="text-xs font-semibold text-gray-500 bg-gray-50 px-2 py-1 rounded-md border border-gray-100">
                  {mealCals} kcal
                </span>
              </div>

              {mealItems.length === 0 ? (
                <p className="text-xs text-gray-400 italic py-2">No foods logged yet.</p>
              ) : (
                <ul className="divide-y divide-gray-50 text-xs">
                  {mealItems.map((item) => (
                    <li key={item.id} className="py-1.5 flex justify-between items-center text-gray-700">
                      <span className="truncate pr-2 font-medium">{item.food_name}</span>
                      <span className="text-gray-400 shrink-0">
                        {item.quantity_grams}g • <strong className="text-gray-800">{Math.round(Number(item.calories))} kcal</strong>
                      </span>
                    </li>
                  ))}
                </ul>
              )}

              <Link
                href={`/log/food?meal=${type}`}
                className="block text-center text-xs font-medium text-emerald-600 hover:text-emerald-700 py-1.5 rounded-lg hover:bg-emerald-50 transition-colors"
              >
                + Add to {title}
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
