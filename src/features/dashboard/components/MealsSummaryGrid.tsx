'use client';

import Link from 'next/link';
import { Coffee, Sun, Moon, Utensils, Plus } from 'lucide-react';
import type { FoodLog } from '@/types/database';

interface MealsSummaryGridProps {
  logs: FoodLog[];
}

const MEAL_SECTIONS = [
  { type: 'breakfast', title: 'Breakfast', icon: Coffee },
  { type: 'lunch', title: 'Lunch', icon: Sun },
  { type: 'dinner', title: 'Dinner', icon: Moon },
  { type: 'snack', title: 'Snacks', icon: Utensils },
] as const;

export function MealsSummaryGrid({ logs }: MealsSummaryGridProps) {
  return (
    <div className="space-y-4 text-left">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-lg font-bold text-[var(--color-neel)]">
          Meals logged today
        </h2>
        <Link
          href="/log/food"
          className="text-xs font-semibold text-[var(--color-neel)] hover:underline"
        >
          View all food logs
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {MEAL_SECTIONS.map(({ type, title, icon: Icon }) => {
          const mealItems = logs.filter((item) => item.meal_type === type);
          const mealCals = Math.round(
            mealItems.reduce((acc, curr) => acc + Number(curr.calories), 0)
          );

          return (
            <div
              key={type}
              className="bg-[var(--color-plate)] rounded-[16px] border border-[var(--color-border)] p-4 sm:p-5 space-y-3 shadow-xs"
            >
              <div className="flex items-center justify-between pb-2 border-b border-[var(--color-border-subtle)]">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-[8px] bg-[var(--color-steel)] text-[var(--color-neel)]">
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <span className="font-heading font-bold text-[var(--color-neel)] text-sm">
                    {title}
                  </span>
                </div>
                <span className="text-xs font-semibold text-[var(--color-neel)] bg-[var(--color-steel)] px-2.5 py-1 rounded-full tabular-nums">
                  {mealCals} kcal
                </span>
              </div>

              {mealItems.length === 0 ? (
                <p className="text-xs text-[var(--color-neel-muted)] py-2 text-left">
                  No food logged for {title.toLowerCase()} yet.
                </p>
              ) : (
                <ul className="divide-y divide-[var(--color-border-subtle)] text-xs">
                  {mealItems.map((item) => (
                    <li
                      key={item.id}
                      className="py-1.5 flex justify-between items-center text-[var(--color-neel)]"
                    >
                      <span className="truncate pr-2 font-medium">{item.food_name}</span>
                      <span className="text-[var(--color-neel-muted)] shrink-0 tabular-nums">
                        {item.quantity_grams}g ·{' '}
                        <strong className="text-[var(--color-neel)]">
                          {Math.round(Number(item.calories))} kcal
                        </strong>
                      </span>
                    </li>
                  ))}
                </ul>
              )}

              <Link
                href={`/log/food?meal=${type}`}
                className="flex items-center justify-center gap-1.5 w-full text-center text-xs font-semibold text-[var(--color-neel)] bg-[var(--color-steel)] hover:bg-[var(--color-border)] py-2 rounded-[10px] transition-colors min-h-[38px]"
              >
                <Plus className="h-3.5 w-3.5" /> Add to {title}
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
