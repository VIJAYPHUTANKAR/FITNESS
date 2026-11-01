/**
 * MealSection: Card displaying items logged under a specific meal type (breakfast/lunch/dinner/snack).
 * Rendered inside FoodLogScreen.
 */

import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import FoodLogItem from './FoodLogItem';
import type { FoodLog, MealType } from '../types';

interface MealSectionProps {
  type: MealType;
  title: string;
  icon: string;
  logs: FoodLog[];
  onOpenAddModal: (type: MealType) => void;
  onRefresh: () => void;
}

export function MealSection({
  type,
  title,
  icon,
  logs,
  onOpenAddModal,
  onRefresh,
}: MealSectionProps) {
  const mealItems = logs.filter((log) => log.meal_type === type);
  const mealCalories = Math.round(
    mealItems.reduce((acc, curr) => acc + Number(curr.calories), 0)
  );

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="text-2xl">{icon}</span>
          <div>
            <h3 className="font-bold text-gray-900 text-base">{title}</h3>
            <p className="text-xs text-gray-400">
              {mealItems.length} {mealItems.length === 1 ? 'item' : 'items'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-gray-700 bg-gray-50 border border-gray-200 px-2.5 py-1 rounded-lg">
            {mealCalories} kcal
          </span>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onOpenAddModal(type)}
            className="text-xs"
          >
            <Plus className="h-3.5 w-3.5 mr-1" /> Add
          </Button>
        </div>
      </div>

      {mealItems.length === 0 ? (
        <p className="text-xs text-gray-400 italic py-2">
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
