'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { scaleMacros } from '@/lib/calc/macros';
import type { FoodLog, MealType } from '@/types/database';

interface FoodLogItemProps {
  entry: FoodLog;
  onUpdate: () => void;
}

const MEAL_BADGE: Record<NonNullable<MealType>, string> = {
  breakfast: 'bg-amber-100 text-amber-800',
  lunch:     'bg-green-100 text-green-800',
  dinner:    'bg-indigo-100 text-indigo-800',
  snack:     'bg-pink-100 text-pink-800',
};

export default function FoodLogItem({ entry, onUpdate }: FoodLogItemProps) {
  const supabase = createClient();

  const [editing, setEditing]     = useState(false);
  const [quantity, setQuantity]   = useState(String(entry.quantity_grams));
  const [saving, setSaving]       = useState(false);
  const [deleting, setDeleting]   = useState(false);
  const [error, setError]         = useState<string | null>(null);

  /* Computed preview calories while editing */
  const previewCalories = (() => {
    const q = parseFloat(quantity);
    if (!isNaN(q) && q > 0) {
      const factor = q / entry.quantity_grams;
      return Math.round(entry.calories * factor);
    }
    return entry.calories;
  })();

  async function handleDelete() {
    setDeleting(true);
    setError(null);
    const { error: err } = await supabase
      .from('food_logs')
      .delete()
      .eq('id', entry.id);
    setDeleting(false);
    if (err) {
      setError(err.message);
      return;
    }
    onUpdate();
  }

  async function handleSave() {
    const q = parseFloat(quantity);
    if (isNaN(q) || q <= 0) {
      setError('Enter a valid quantity.');
      return;
    }
    setSaving(true);
    setError(null);

    /* Re-scale macros from stored per-gram rate */
    const perGram = {
      calories_per_100g: (entry.calories / entry.quantity_grams) * 100,
      protein_g:         entry.protein_g != null ? (entry.protein_g / entry.quantity_grams) * 100 : null,
      carbs_g:           entry.carbs_g   != null ? (entry.carbs_g   / entry.quantity_grams) * 100 : null,
      fat_g:             entry.fat_g     != null ? (entry.fat_g     / entry.quantity_grams) * 100 : null,
    };
    const scaled = scaleMacros(perGram, q);

    const { error: err } = await supabase
      .from('food_logs')
      .update({
        quantity_grams: q,
        calories:       Math.round(scaled.calories),
        protein_g:      Math.round(scaled.protein_g * 10) / 10,
        carbs_g:        Math.round(scaled.carbs_g   * 10) / 10,
        fat_g:          Math.round(scaled.fat_g     * 10) / 10,
      })
      .eq('id', entry.id);

    setSaving(false);
    if (err) {
      setError(err.message);
      return;
    }
    setEditing(false);
    onUpdate();
  }

  const mealClass =
    entry.meal_type ? MEAL_BADGE[entry.meal_type] : 'bg-gray-100 text-gray-600';

  return (
    <div className="flex items-center justify-between gap-3 py-2 px-3 rounded-lg bg-white border border-gray-100 shadow-sm">
      {/* Left: name + badge */}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-800 truncate">{entry.food_name}</p>
        <div className="flex items-center gap-2 mt-0.5">
          {entry.meal_type && (
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${mealClass}`}>
              {entry.meal_type}
            </span>
          )}
          {editing ? (
            <div className="flex items-center gap-1">
              <input
                type="number"
                min="1"
                step="1"
                value={quantity}
                onChange={e => setQuantity(e.target.value)}
                className="w-20 text-sm border border-gray-300 rounded px-1.5 py-0.5 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <span className="text-xs text-gray-500">g</span>
              <span className="text-xs text-indigo-600 font-semibold ml-1">
                ≈ {previewCalories} kcal
              </span>
            </div>
          ) : (
            <span className="text-xs text-gray-500">{entry.quantity_grams} g</span>
          )}
        </div>
        {error && <p className="text-xs text-red-500 mt-0.5">{error}</p>}
      </div>

      {/* Right: calories + actions */}
      <div className="flex items-center gap-1 shrink-0">
        {!editing && (
          <span className="text-sm font-semibold text-gray-700 mr-2">
            {entry.calories} kcal
          </span>
        )}

        {editing ? (
          <>
            <button
              onClick={handleSave}
              disabled={saving}
              className="text-xs px-2 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              {saving ? 'Saving…' : 'Save'}
            </button>
            <button
              onClick={() => { setEditing(false); setQuantity(String(entry.quantity_grams)); setError(null); }}
              className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => setEditing(true)}
              title="Edit quantity"
              className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-indigo-600 transition-colors"
            >
              {/* Pencil icon */}
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path d="M2.695 14.763l-1.262 3.154a.5.5 0 0 0 .65.65l3.155-1.262a4 4 0 0 0 1.343-.885L17.5 5.5a2.121 2.121 0 0 0-3-3L4.58 13.42a4 4 0 0 0-.885 1.343z" />
              </svg>
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              title="Delete entry"
              className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-red-500 disabled:opacity-50 transition-colors"
            >
              {/* Trash icon */}
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 0 0 6 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 1 0 .23 1.482l.149-.022.841 10.518A2.75 2.75 0 0 0 7.596 19h4.807a2.75 2.75 0 0 0 2.742-2.53l.841-10.52.149.023a.75.75 0 0 0 .23-1.482A41.03 41.03 0 0 0 14 4.193v-.443A2.75 2.75 0 0 0 11.25 1h-2.5ZM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4ZM8.58 7.72a.75.75 0 0 0-1.5.06l.3 7.5a.75.75 0 1 0 1.5-.06l-.3-7.5Zm4.34.06a.75.75 0 1 0-1.5-.06l-.3 7.5a.75.75 0 1 0 1.5.06l.3-7.5Z" clipRule="evenodd" />
              </svg>
            </button>
          </>
        )}
      </div>
    </div>
  );
}
