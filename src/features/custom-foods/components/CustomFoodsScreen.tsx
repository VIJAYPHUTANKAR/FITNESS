/**
 * CustomFoodsScreen: User custom food catalog management screen.
 * Rendered by src/app/(app)/foods/custom/page.tsx.
 */

'use client';

import Link from 'next/link';
import { ChevronLeft, Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { CustomFoodForm } from './CustomFoodForm';
import { CustomFoodList } from './CustomFoodList';
import { useCustomFoods } from '../hooks/useCustomFoods';

export function CustomFoodsScreen() {
  const {
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
  } = useCustomFoods();

  return (
    <div className="mx-auto max-w-4xl p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Link href="/log/food" className="text-ink/50 hover:text-ink transition-colors">
              <ChevronLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-2xl font-heading font-bold text-ink">Custom Foods Library</h1>
          </div>
          <p className="text-xs text-ink/60 mt-1 pl-7">
            Add homemade meals, regional Indian recipes, or specific brands.
          </p>
        </div>

        <Button onClick={() => setShowAddForm(!showAddForm)}>
          <Plus className="h-4 w-4 mr-1.5" />
          {showAddForm ? 'Close Form' : 'Add Custom Food'}
        </Button>
      </div>

      {showAddForm && (
        <CustomFoodForm
          name={name}
          setName={setName}
          brand={brand}
          setBrand={setBrand}
          servingDesc={servingDesc}
          setServingDesc={setServingDesc}
          servingGrams={servingGrams}
          setServingGrams={setServingGrams}
          caloriesPer100g={caloriesPer100g}
          setCaloriesPer100g={setCaloriesPer100g}
          proteinG={proteinG}
          setProteinG={setProteinG}
          carbsG={carbsG}
          setCarbsG={setCarbsG}
          fatG={fatG}
          setFatG={setFatG}
          fiberG={fiberG}
          setFiberG={setFiberG}
          saving={saving}
          error={error}
          onCancel={() => setShowAddForm(false)}
          onSubmit={handleAddFood}
        />
      )}

      <CustomFoodList
        foods={foods}
        loading={loading}
        deleteError={deleteError}
        onDeleteFood={handleDeleteFood}
      />
    </div>
  );
}
