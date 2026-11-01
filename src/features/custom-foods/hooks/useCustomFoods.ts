'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { CustomFoodFormSchema } from '@/lib/validation/schemas';
import { formatSupabaseError } from '@/lib/errors';
import {
  fetchCustomFoods as fetchFoodsApi,
  insertCustomFood,
  deleteCustomFood as deleteFoodApi,
} from '../services/customFoodService';
import type { Food } from '../types';

/**
 * Hook managing custom foods catalog state, form inputs, and mutations.
 */
export function useCustomFoods() {
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
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const fetchFoods = useCallback(async () => {
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    const data = await fetchFoodsApi(user.id);
    setFoods(data);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    void (async () => {
      await fetchFoods();
    })();
  }, [fetchFoods]);

  async function handleAddFood(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

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
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError('Please sign in to add custom foods.');
      setSaving(false);
      return;
    }

    const { error: insertErr } = await insertCustomFood(user.id, validation.data);
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
    fetchFoods();
  }

  async function handleDeleteFood(id: number) {
    setDeleteError(null);
    const { error: delErr } = await deleteFoodApi(id);
    if (delErr) {
      setDeleteError(formatSupabaseError(delErr));
      return;
    }
    await fetchFoods();
  }

  return {
    foods,
    loading,
    showAddForm,
    setShowAddForm,
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
    deleteError,
    handleAddFood,
    handleDeleteFood,
  };
}
