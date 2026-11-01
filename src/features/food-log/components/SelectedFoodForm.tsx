/**
 * SelectedFoodForm: Portion sizing and macro scaling confirmation form for a chosen food item.
 * Rendered inside FoodSearch.
 */

'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { scaleMacros } from '@/lib/calc/macros';
import { formatSupabaseError } from '@/lib/errors';
import { FoodLogFormSchema } from '@/lib/validation/schemas';
import { Button } from '@/components/ui/Button';
import { Plus, Loader2 } from 'lucide-react';
import type { FoodSearchResult } from '../types';
import type { MealType } from '@/types/database';

interface SelectedFoodFormProps {
  selectedFood: FoodSearchResult;
  mealType: MealType;
  loggedOn: string;
  initialGrams?: number;
  onSuccess: () => void;
  onCancel: () => void;
  onClose?: () => void;
}

export function SelectedFoodForm({
  selectedFood,
  mealType,
  loggedOn,
  initialGrams = 100,
  onSuccess,
  onCancel,
  onClose,
}: SelectedFoodFormProps) {
  const [grams, setGrams] = useState<number>(initialGrams);
  const [logging, setLogging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const scaled = scaleMacros(
    {
      calories_per_100g: selectedFood.calories_per_100g,
      protein_g: selectedFood.protein_g,
      carbs_g: selectedFood.carbs_g,
      fat_g: selectedFood.fat_g,
    },
    grams
  );

  async function handleLogFood() {
    setLogging(true);
    setError(null);

    const payload = {
      food_id: selectedFood.id ?? null,
      food_name: selectedFood.name,
      logged_on: loggedOn,
      meal_type: mealType,
      quantity_grams: grams,
      calories: Math.round(scaled.calories),
      protein_g: Math.round(scaled.protein_g * 10) / 10,
      carbs_g: Math.round(scaled.carbs_g * 10) / 10,
      fat_g: Math.round(scaled.fat_g * 10) / 10,
    };

    const validation = FoodLogFormSchema.safeParse(payload);
    if (!validation.success) {
      setError(validation.error.issues[0]?.message || 'Invalid food entry.');
      setLogging(false);
      return;
    }

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError('Please sign in to log food.');
      setLogging(false);
      return;
    }

    const { error: insertErr } = await supabase.from('food_logs').insert({
      user_id: user.id,
      ...validation.data,
    });

    setLogging(false);

    if (insertErr) {
      setError(formatSupabaseError(insertErr));
      return;
    }

    onSuccess();
    if (onClose) onClose();
  }

  return (
    <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-4 transition-all">
      {error && (
        <div className="p-2.5 text-xs bg-red-50 text-red-600 rounded-lg">
          {error}
        </div>
      )}

      <div className="flex justify-between items-start gap-2">
        <div>
          <p className="font-semibold text-gray-900 text-sm">{selectedFood.name}</p>
          {selectedFood.brand && (
            <p className="text-xs text-gray-500">{selectedFood.brand}</p>
          )}
          {selectedFood.source === 'openfoodfacts' && (
            <p className="text-[10px] text-gray-500 mt-0.5">
              Source:{' '}
              <a
                href="https://world.openfoodfacts.org"
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-700 underline"
              >
                Open Food Facts (ODbL)
              </a>
            </p>
          )}
        </div>
        <button
          onClick={onCancel}
          className="text-xs text-gray-400 hover:text-gray-600"
        >
          Change
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Portion (grams / ml)
          </label>
          <input
            type="number"
            min="1"
            max="5000"
            value={grams}
            onChange={(e) => setGrams(Math.max(1, Math.min(5000, Number(e.target.value) || 0)))}
            className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
        </div>
        <div className="flex flex-col justify-end">
          <span className="text-xs text-gray-500">Estimated Energy</span>
          <span className="text-xl font-bold text-emerald-700">
            {Math.round(scaled.calories)} <span className="text-xs font-normal">kcal</span>
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4 text-xs text-gray-600 bg-white/70 p-2.5 rounded-xl border border-emerald-100">
        <span>P: <strong>{scaled.protein_g.toFixed(1)}g</strong></span>
        <span>C: <strong>{scaled.carbs_g.toFixed(1)}g</strong></span>
        <span>F: <strong>{scaled.fat_g.toFixed(1)}g</strong></span>
      </div>

      <div className="flex gap-2 justify-end">
        {onClose && (
          <Button variant="ghost" size="sm" onClick={onClose} disabled={logging}>
            Cancel
          </Button>
        )}
        <Button size="sm" onClick={handleLogFood} disabled={logging}>
          {logging ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-1" /> Adding...
            </>
          ) : (
            <>
              <Plus className="h-4 w-4 mr-1" /> Add to {mealType}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
