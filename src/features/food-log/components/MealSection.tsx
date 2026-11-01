/**
 * MealSection: Card displaying items logged under a specific meal type (breakfast/lunch/dinner/snack).
 * Rendered inside FoodLogScreen.
 */

'use client';

import { Plus, Coffee, Sun, Moon, Utensils } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import FoodLogItem from './FoodLogItem';
import type { FoodLog, MealType } from '../types';

interface MealSectionProps {
  type: MealType;
  title: string;
  icon?: string;
  logs: FoodLog[];
  onOpenAddModal: (type: MealType) => void;
  onRefresh: () => void;
}

function getMealIcon(type: MealType) {
  switch (type) {
    case 'breakfast':
      return <Coffee className="h-5 w-5 text-haldi-600" />;
    case 'lunch':
      return <Sun className="h-5 w-5 text-haldi-600" />;
    case 'dinner':
      return <Moon className="h-5 w-5 text-haldi-600" />;
    case 'snack':
      return <Utensils className="h-5 w-5 text-haldi-600" />;
    default:
      return <Utensils className="h-5 w-5 text-haldi-600" />;
  }
}

export function MealSection({
  type,
  title,
  logs,
  onOpenAddModal,
  onRefresh,
}: MealSectionProps) {
  const mealItems = logs.filter((log) => log.meal_type === type);
  const mealCalories = Math.round(
    mealItems.reduce((acc, curr) => acc + Number(curr.calories), 0)
  );

  return (
    <div className="bg-plate rounded-2xl border border-steel-200/80 p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-steel-100 flex items-center justify-center text-ink">
            {getMealIcon(type)}
          </div>
          <div>
            <h3 className="font-heading font-semibold text-ink text-base">{title}</h3>
            <p className="text-xs text-ink/60">
              {mealItems.length} {mealItems.length === 1 ? 'item' : 'items'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-ink bg-steel-100 border border-steel-200 px-2.5 py-1 rounded-lg tabular-nums">
            {mealCalories} kcal
          </span>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => onOpenAddModal(type)}
            className="text-xs"
          >
            <Plus className="h-3.5 w-3.5 mr-1" /> Add
          </Button>
        </div>
      </div>

      {mealItems.length === 0 ? (
        <p className="text-xs text-ink/50 italic py-2">
          No food logged for {title.toLowerCase()}.
        </p>
      ) : (
        <div className="space-y-2">
          {mealItems.map((item) => (
            <FoodLogItem
              key={item.id}
              entry={item}
              onUpdate={onRefresh}
            />
          ))}
        </div>
      )}
    </div>
  );
}
