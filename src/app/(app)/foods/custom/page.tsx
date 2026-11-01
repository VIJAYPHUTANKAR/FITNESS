'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import type { Food } from '@/types/database';
import { CustomFoodFormSchema } from '@/lib/validation/schemas';
import { formatSupabaseError } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import {
  Sparkles,
  Plus,
  Trash2,
  ChevronLeft,
  Loader2,
  AlertCircle,
  Check
} from 'lucide-react';

export default function CustomFoodsPage() {
  const supabase = createClient();

  const [foods, setFoods] = useState<Food[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [servingDesc, setServingDesc] = useState('100 g');
  const [servingGrams, setServingGrams] = useState(100);
  const [caloriesPer100g, setCaloriesPer100g] = useState<number | ''>('');
  const [proteinG, setProteinG] = useState<number | ''>('');
  const [carbsG, setCarbsG] = useState<number | ''>('');
  const [fatG, setFatG] = useState<number | ''>('');
  const [fiberG, setFiberG] = useState<number | ''>('');

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCustomFoods = useCallback(async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    const { data } = await supabase
      .from('foods')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (data) {
      setFoods(data);
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchCustomFoods();
  }, [fetchCustomFoods]);

  async function handleAddFood(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    // Zod validation
    const validation = CustomFoodFormSchema.safeParse({
      name: name.trim(),
      brand: brand.trim() || null,
      serving_desc: servingDesc.trim() || '100 g',
      serving_grams: Number(servingGrams) || 100,
      calories_per_100g: caloriesPer100g === '' ? -1 : Number(caloriesPer100g),
      protein_g: proteinG !== '' ? Number(proteinG) : null,
      carbs_g: carbsG !== '' ? Number(carbsG) : null,
      fat_g: fatG !== '' ? Number(fatG) : null,
      fiber_g: fiberG !== '' ? Number(fiberG) : null,
    });

    if (!validation.success) {
      setError(validation.error.issues[0]?.message || 'Please verify food inputs.');
      return;
    }

    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError('Please sign in to add custom foods.');
      setSaving(false);
      return;
    }

    const { error: insertErr } = await supabase.from('foods').insert({
      user_id: user.id,
      ...validation.data,
      source: 'custom',
    });

    setSaving(false);

    if (insertErr) {
      setError(formatSupabaseError(insertErr));
      return;
    }

    // Reset form
    setName('');
    setBrand('');
    setServingDesc('100 g');
    setServingGrams(100);
    setCaloriesPer100g('');
    setProteinG('');
    setCarbsG('');
    setFatG('');
    setFiberG('');
    setShowAddForm(false);
    fetchCustomFoods();
  }

  async function handleDeleteFood(id: number) {
    await supabase.from('foods').delete().eq('id', id);
    fetchCustomFoods();
  }

  return (
    <div className="mx-auto max-w-4xl p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Link href="/log/food" className="text-gray-400 hover:text-gray-600">
              <ChevronLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Custom Foods Library</h1>
          </div>
          <p className="text-xs text-gray-500 mt-1 pl-7">
            Add homemade meals, regional Indian recipes, or specific brands.
          </p>
        </div>

        <Button onClick={() => setShowAddForm(!showAddForm)}>
          <Plus className="h-4 w-4 mr-1.5" />
          {showAddForm ? 'Close Form' : 'Add Custom Food'}
        </Button>
      </div>

      {/* Add Food Form Drawer / Box */}
      {showAddForm && (
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

          <form onSubmit={handleAddFood} className="space-y-4">
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
              <Button type="button" variant="ghost" onClick={() => setShowAddForm(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Check className="h-4 w-4 mr-1" />}
                Save Food
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Custom Foods List */}
      <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm space-y-4">
        <h2 className="font-bold text-gray-900 text-base">Your Custom Items ({foods.length})</h2>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-7 w-7 text-emerald-600 animate-spin" />
          </div>
        ) : foods.length === 0 ? (
          <div className="text-center py-12 text-gray-400 space-y-2">
            <Sparkles className="h-10 w-10 mx-auto text-gray-200" />
            <p className="text-sm">No custom foods created yet.</p>
            <p className="text-xs text-gray-400">Click &ldquo;Add Custom Food&rdquo; to add your own dishes.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {foods.map((food) => (
              <div key={food.id} className="py-3 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-semibold text-gray-900 text-sm truncate">{food.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {food.serving_desc} • {Math.round(Number(food.calories_per_100g))} kcal/100g
                    {food.protein_g != null && ` • P: ${food.protein_g}g`}
                    {food.carbs_g != null && ` • C: ${food.carbs_g}g`}
                    {food.fat_g != null && ` • F: ${food.fat_g}g`}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <button
                    onClick={() => handleDeleteFood(food.id)}
                    className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
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
    </div>
  );
}
