/**
 * FoodLogScreen: Interactive food logging view featuring date navigation, meal section cards,
 * inline editing/deletion, and modal food search. Rendered by src/app/(app)/log/food/page.tsx.
 */

'use client';

import { Suspense } from 'react';
import { Loader2, Utensils, X } from 'lucide-react';
import { useFoodLog } from '../hooks/useFoodLog';
import { FoodLogDateBar } from './FoodLogDateBar';
import { MealSection } from './MealSection';
import { FoodSearch } from './FoodSearch';
import type { MealSectionConfig } from '../types';

const MEAL_CONFIGS: MealSectionConfig[] = [
  { type: 'breakfast', title: 'Breakfast', icon: '🌅' },
  { type: 'lunch', title: 'Lunch', icon: '☀️' },
  { type: 'dinner', title: 'Dinner', icon: '🌙' },
  { type: 'snack', title: 'Snacks', icon: '🍎' },
];

function FoodLogContent() {
  const {
    loggedOn,
    setLoggedOn,
    logs,
    loading,
    activeModalMeal,
    setActiveModalMeal,
    fetchLogs,
    changeDate,
    totalCalories,
    totalProtein,
    totalCarbs,
    totalFat,
  } = useFoodLog();

  return (
    <div className="mx-auto max-w-4xl p-4 sm:p-6 lg:p-8 space-y-6">
      <FoodLogDateBar
        loggedOn={loggedOn}
        setLoggedOn={setLoggedOn}
        changeDate={changeDate}
        totalCalories={totalCalories}
        totalProtein={totalProtein}
        totalCarbs={totalCarbs}
        totalFat={totalFat}
      />

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 text-emerald-600 animate-spin" />
        </div>
      ) : (
        <div className="space-y-4">
          {MEAL_CONFIGS.map(({ type, title, icon }) => (
            <MealSection
              key={type}
              type={type}
              title={title}
              icon={icon}
              logs={logs}
              onOpenAddModal={(m) => setActiveModalMeal(m)}
              onRefresh={fetchLogs}
            />
          ))}
        </div>
      )}

      {/* Add Food Modal */}
      {activeModalMeal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl p-6 border border-gray-100 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Utensils className="h-5 w-5 text-emerald-600" />
                <h3 className="font-bold text-gray-900 text-base capitalize">
                  Add to {activeModalMeal}
                </h3>
              </div>
              <button
                onClick={() => setActiveModalMeal(null)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <FoodSearch
              mealType={activeModalMeal}
              loggedOn={loggedOn}
              onSuccess={fetchLogs}
              onClose={() => setActiveModalMeal(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export function FoodLogScreen() {
  return (
    <Suspense fallback={
      <div className="flex justify-center py-16">
        <Loader2 className="h-8 w-8 text-emerald-600 animate-spin" />
      </div>
    }>
      <FoodLogContent />
    </Suspense>
  );
}
