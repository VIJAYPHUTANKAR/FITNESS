'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { scaleMacros } from '@/lib/calc/macros';
import { Pencil, Trash2, Check, X, Loader2 } from 'lucide-react';
import type { FoodLog, MealType } from '@/types/database';

interface FoodLogItemProps {
  entry: FoodLog;
  onUpdate: () => void;
}

const MEAL_BADGE: Record<NonNullable<MealType>, string> = {
  breakfast: 'bg-haldi-100 text-haldi-800 border-haldi-200',
  lunch:     'bg-patta-100 text-patta-800 border-patta-200',
  dinner:    'bg-steel-200 text-steel-800 border-steel-300',
  snack:     'bg-chukandar-100 text-chukandar-800 border-chukandar-200',
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
    entry.meal_type ? MEAL_BADGE[entry.meal_type] : 'bg-steel-100 text-ink/70 border-steel-200';

  return (
    <div className="flex items-center justify-between gap-3 py-2.5 px-3 rounded-xl bg-plate-muted border border-steel-200/70">
      {/* Left: name + badge */}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-ink truncate text-sm">{entry.food_name}</p>
        <div className="flex items-center gap-2 mt-0.5">
          {entry.meal_type && (
            <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full capitalize border ${mealClass}`}>
              {entry.meal_type}
            </span>
          )}
          {editing ? (
            <div className="flex items-center gap-1.5">
              <input
                type="number"
                min="1"
                step="1"
                value={quantity}
                onChange={e => setQuantity(e.target.value)}
                className="w-16 text-xs bg-plate border border-steel-300 rounded px-1.5 py-0.5 text-ink focus:outline-none focus:ring-1 focus:ring-haldi-500"
              />
              <span className="text-xs text-ink/60">g</span>
              <span className="text-xs text-haldi-700 font-semibold ml-1 tabular-nums">
                ≈ {previewCalories} kcal
              </span>
            </div>
          ) : (
            <span className="text-xs text-ink/60 tabular-nums">{entry.quantity_grams} g</span>
          )}
        </div>
        {error && <p className="text-xs text-chukandar-600 mt-0.5">{error}</p>}
      </div>

      {/* Right: calories + actions */}
      <div className="flex items-center gap-1.5 shrink-0">
        {!editing && (
          <span className="text-sm font-semibold text-ink mr-2 tabular-nums">
            {entry.calories} kcal
          </span>
        )}

        {editing ? (
          <div className="flex items-center gap-1">
            <button
              onClick={handleSave}
              disabled={saving}
              className="p-1 rounded bg-neel-700 text-white hover:bg-neel-800 disabled:opacity-50 transition-colors"
              title="Save changes"
            >
              {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
            </button>
            <button
              onClick={() => { setEditing(false); setQuantity(String(entry.quantity_grams)); setError(null); }}
              className="p-1 rounded bg-steel-200 text-ink/70 hover:bg-steel-300 transition-colors"
              title="Cancel"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-1">
            <button
              onClick={() => setEditing(true)}
              title="Edit quantity"
              className="p-1.5 rounded-lg hover:bg-steel-100 text-ink/50 hover:text-ink transition-colors"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              title="Delete entry"
              className="p-1.5 rounded-lg hover:bg-steel-100 text-ink/50 hover:text-chukandar-600 disabled:opacity-50 transition-colors"
            >
              {deleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
