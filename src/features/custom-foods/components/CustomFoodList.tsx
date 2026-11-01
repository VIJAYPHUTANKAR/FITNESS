/**
 * CustomFoodList: Renders user-created custom food items with nutritional summaries and deletion actions.
 * Rendered inside CustomFoodsScreen.
 */

'use client';

import { Sparkles, Trash2, Loader2, AlertCircle } from 'lucide-react';
import type { Food } from '../types';

interface CustomFoodListProps {
  foods: Food[];
  loading: boolean;
  deleteError: string | null;
  onDeleteFood: (id: number) => void;
}

export function CustomFoodList({
  foods,
  loading,
  deleteError,
  onDeleteFood,
}: CustomFoodListProps) {
  return (
    <div className="bg-plate rounded-2xl border border-steel-200/80 p-6 shadow-xs space-y-4">
      <h2 className="font-heading font-semibold text-ink text-base">Your Custom Items ({foods.length})</h2>

      {deleteError && (
        <div className="p-3 text-xs bg-chukandar-50 text-chukandar-700 border border-chukandar-200 rounded-xl flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{deleteError}</span>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-7 w-7 text-haldi-600 animate-spin" />
        </div>
      ) : foods.length === 0 ? (
        <div className="text-center py-12 text-ink/50 space-y-2">
          <Sparkles className="h-10 w-10 mx-auto text-steel-300" />
          <p className="text-sm">No custom foods created yet.</p>
          <p className="text-xs text-ink/40">Click &ldquo;Add Custom Food&rdquo; to add your own dishes.</p>
        </div>
      ) : (
        <div className="divide-y divide-steel-100">
          {foods.map((food) => (
            <div key={food.id} className="py-3 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="font-semibold text-ink text-sm truncate">{food.name}</p>
                <p className="text-xs text-ink/60 mt-0.5 tabular-nums">
                  {food.serving_desc} • {Math.round(Number(food.calories_per_100g))} kcal/100g
                  {food.protein_g != null && ` • P: ${food.protein_g}g`}
                  {food.carbs_g != null && ` • C: ${food.carbs_g}g`}
                  {food.fat_g != null && ` • F: ${food.fat_g}g`}
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <button
                  onClick={() => onDeleteFood(food.id)}
                  className="p-1.5 text-ink/40 hover:text-chukandar-600 rounded-lg hover:bg-steel-100 transition-colors"
                  title="Delete item"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
