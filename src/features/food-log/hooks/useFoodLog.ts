'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { todayISO, addDays } from '@/lib/dates';
import type { FoodLog, MealType } from '../types';

/**
 * Hook managing food logging screen state, date navigation, and daily macro totals.
 */
export function useFoodLog() {
  const supabase = createClient();
  const searchParams = useSearchParams();
  const initialMeal = (searchParams.get('meal') as MealType) || null;

  const [loggedOn, setLoggedOn] = useState(todayISO());
  const [logs, setLogs] = useState<FoodLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeModalMeal, setActiveModalMeal] = useState<MealType | null>(initialMeal);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();

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

  function changeDate(days: number) {
    setLoggedOn(addDays(loggedOn, days));
  }

  const totalCalories = Math.round(logs.reduce((sum, item) => sum + Number(item.calories), 0));
  const totalProtein = Math.round(logs.reduce((sum, item) => sum + Number(item.protein_g ?? 0), 0));
  const totalCarbs = Math.round(logs.reduce((sum, item) => sum + Number(item.carbs_g ?? 0), 0));
  const totalFat = Math.round(logs.reduce((sum, item) => sum + Number(item.fat_g ?? 0), 0));

  return {
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
  };
}
