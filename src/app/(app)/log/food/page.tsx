'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { todayISO } from '@/lib/utils';
import type { FoodLog, MealType } from '@/types/database';
import FoodLogItem from '@/components/FoodLogItem';
import { FoodSearch } from '@/components/FoodSearch';
import { Button } from '@/components/ui/Button';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Plus,
  Utensils,
  Loader2,
  X
} from 'lucide-react';

const MEALS: { type: MealType; title: string; icon: string }[] = [
  { type: 'breakfast', title: 'Breakfast', icon: '🌅' },
  { type: 'lunch',     title: 'Lunch',     icon: '☀️' },
  { type: 'dinner',    title: 'Dinner',    icon: '🌙' },
  { type: 'snack',     title: 'Snacks',    icon: '🍎' },
];

export default function LogFoodPage() {
  const supabase = createClient();
  const searchParams = useSearchParams();
  const initialMeal = (searchParams.get('meal') as MealType) || null;

  const [loggedOn, setLoggedOn] = useState(todayISO());
  const [logs, setLogs] = useState<FoodLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeModalMeal, setActiveModalMeal] = useState<MealType | null>(initialMeal);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('food_logs')
      .select('*')
      .eq('user_id', user.id)
      .eq('logged_on', loggedOn)
      .order('created_at', { ascending: true });

    if (!error && data) {
      setLogs(data);
    }
    setLoading(false);
  }, [supabase, loggedOn]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // Date navigation helpers
  function changeDate(days: number) {
    const current = new Date(loggedOn);
    current.setDate(current.getDate() + days);
    setLoggedOn(current.toISOString().split('T')[0]);
  }

  // Summary calculations
  const totalCalories = Math.round(logs.reduce((sum, item) => sum + Number(item.calories), 0));
  const totalProtein  = Math.round(logs.reduce((sum, item) => sum + Number(item.protein_g ?? 0), 0));
  const totalCarbs    = Math.round(logs.reduce((sum, item) => sum + Number(item.carbs_g ?? 0), 0));
  const totalFat      = Math.round(logs.reduce((sum, item) => sum + Number(item.fat_g ?? 0), 0));

  return (
    <div className="mx-auto max-w-4xl p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Date Header Controller */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => changeDate(-1)}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gray-50 border border-gray-200">
            <Calendar className="h-4 w-4 text-emerald-600" />
            <input
              type="date"
              value={loggedOn}
              onChange={(e) => setLoggedOn(e.target.value)}
              className="text-sm font-semibold text-gray-800 bg-transparent focus:outline-none"
            />
          </div>
          <Button variant="ghost" size="sm" onClick={() => changeDate(1)}>
            <ChevronRight className="h-5 w-5" />
          </Button>
          {loggedOn !== todayISO() && (
            <button
              onClick={() => setLoggedOn(todayISO())}
              className="text-xs font-semibold text-emerald-600 hover:underline ml-1"
            >
              Today
            </button>
          )}
        </div>

        {/* Quick totals badge */}
        <div className="flex items-center gap-4 text-xs font-medium text-gray-600">
          <div className="bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100 text-emerald-800 font-bold">
            {totalCalories} kcal total
          </div>
          <div className="hidden sm:flex items-center gap-3 text-gray-500">
            <span>P: <strong className="text-gray-800">{totalProtein}g</strong></span>
            <span>C: <strong className="text-gray-800">{totalCarbs}g</strong></span>
            <span>F: <strong className="text-gray-800">{totalFat}g</strong></span>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 text-emerald-600 animate-spin" />
        </div>
      ) : (
        /* Meal Sections */
        <div className="space-y-4">
          {MEALS.map(({ type, title, icon }) => {
            const mealItems = logs.filter((log) => log.meal_type === type);
            const mealCalories = Math.round(
              mealItems.reduce((acc, curr) => acc + Number(curr.calories), 0)
            );

            return (
              <div
                key={type}
                className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">{icon}</span>
                    <div>
                      <h3 className="font-bold text-gray-900 text-base">{title}</h3>
                      <p className="text-xs text-gray-400">
                        {mealItems.length} {mealItems.length === 1 ? 'item' : 'items'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-gray-700 bg-gray-50 border border-gray-200 px-2.5 py-1 rounded-lg">
                      {mealCalories} kcal
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setActiveModalMeal(type)}
                      className="text-xs"
                    >
                      <Plus className="h-3.5 w-3.5 mr-1" /> Add
                    </Button>
                  </div>
                </div>

                {/* Logged list */}
                {mealItems.length === 0 ? (
                  <p className="text-xs text-gray-400 italic py-2">
                    No food logged for {title.toLowerCase()}.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {mealItems.map((item) => (
                      <FoodLogItem
                        key={item.id}
                        entry={item}
                        onUpdate={fetchLogs}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add Food Modal / Drawer */}
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
