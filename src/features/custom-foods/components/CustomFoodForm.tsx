/**
 * CustomFoodForm: Form for adding a new dish, recipe, or brand with nutrition metrics.
 * Rendered inside CustomFoodsScreen.
 */

'use client';

import { Sparkles, AlertCircle, Loader2, Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface CustomFoodFormProps {
  name: string;
  setName: (v: string) => void;
  brand: string;
  setBrand: (v: string) => void;
  servingDesc: string;
  setServingDesc: (v: string) => void;
  servingGrams: number;
  setServingGrams: (v: number) => void;
  caloriesPer100g: number | '';
  setCaloriesPer100g: (v: number | '') => void;
  proteinG: number | '';
  setProteinG: (v: number | '') => void;
  carbsG: number | '';
  setCarbsG: (v: number | '') => void;
  fatG: number | '';
  setFatG: (v: number | '') => void;
  fiberG: number | '';
  setFiberG: (v: number | '') => void;
  saving: boolean;
  error: string | null;
  onCancel: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function CustomFoodForm({
  name,
  setName,
  brand,
  setBrand,
  servingDesc,
  setServingDesc,
  servingGrams,
  setServingGrams,
  caloriesPer100g,
  setCaloriesPer100g,
  proteinG,
  setProteinG,
  carbsG,
  setCarbsG,
  fatG,
  setFatG,
  fiberG,
  setFiberG,
  saving,
  error,
  onCancel,
  onSubmit,
}: CustomFoodFormProps) {
  return (
    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
      <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
        <Sparkles className="h-5 w-5 text-emerald-600" />
        <h2 className="font-bold text-gray-900 text-base">New Custom Food Details</h2>
      </div>

      {error && (
        <div className="p-3 text-xs bg-red-50 text-red-600 rounded-xl flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Food / Dish Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Grandma's Moong Dal Khichdi"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Brand / Source (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Homemade, Amul, Haldirams"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Calories per 100g *
            </label>
            <input
              type="number"
              required
              min="0"
              max="900"
              placeholder="kcal"
              value={caloriesPer100g}
              onChange={(e) => setCaloriesPer100g(e.target.value === '' ? '' : Number(e.target.value))}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Serving Description
            </label>
            <input
              type="text"
              placeholder="e.g. 1 bowl (200g)"
              value={servingDesc}
              onChange={(e) => setServingDesc(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Serving Grams
            </label>
            <input
              type="number"
              min="1"
              max="5000"
              value={servingGrams}
              onChange={(e) => setServingGrams(Number(e.target.value) || 100)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Macros */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Protein (g/100g)
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="100"
              placeholder="0"
              value={proteinG}
              onChange={(e) => setProteinG(e.target.value === '' ? '' : Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Carbs (g/100g)
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="100"
              placeholder="0"
              value={carbsG}
              onChange={(e) => setCarbsG(e.target.value === '' ? '' : Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Fat (g/100g)
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="100"
              placeholder="0"
              value={fatG}
              onChange={(e) => setFatG(e.target.value === '' ? '' : Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Fiber (g/100g)
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="100"
              placeholder="0"
              value={fiberG}
              onChange={(e) => setFiberG(e.target.value === '' ? '' : Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Check className="h-4 w-4 mr-1" />}
            Save Food
          </Button>
        </div>
      </form>
    </div>
  );
}
