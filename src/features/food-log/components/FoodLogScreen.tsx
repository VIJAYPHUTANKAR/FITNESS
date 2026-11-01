/**
 * FoodLogScreen: Interactive food logging view featuring date navigation, meal section cards,
 * inline editing/deletion, and Sheet-based modal food search. Rendered by src/app/(app)/log/food/page.tsx.
 */

'use client';

import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import { useFoodLog } from '../hooks/useFoodLog';
import { FoodLogDateBar } from './FoodLogDateBar';
import { MealSection } from './MealSection';
import { FoodSearch } from './FoodSearch';
import { Sheet } from '@/components/ui/Sheet';
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
          <Loader2 className="h-8 w-8 text-haldi-600 animate-spin" />
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

      {/* Add Food Sheet Modal */}
      <Sheet
        open={activeModalMeal !== null}
        onClose={() => setActiveModalMeal(null)}
        title={activeModalMeal ? `Add to ${activeModalMeal}` : 'Add Food'}
        description="Search our Indian food database or add custom items."
      >
        {activeModalMeal && (
          <FoodSearch
            mealType={activeModalMeal}
            loggedOn={loggedOn}
            onSuccess={fetchLogs}
            onClose={() => setActiveModalMeal(null)}
          />
        )}
      </Sheet>
    </div>
  );
}

export function FoodLogScreen() {
  return (
    <Suspense fallback={
      <div className="flex justify-center py-16">
        <Loader2 className="h-8 w-8 text-haldi-600 animate-spin" />
      </div>
    }>
      <FoodLogContent />
    </Suspense>
  );
}
