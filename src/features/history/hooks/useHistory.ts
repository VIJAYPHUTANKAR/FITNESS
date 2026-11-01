'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { todayISO, addDays } from '@/lib/dates';
import { fetchHistoryData } from '../services/historyService';
import type {
  DateRange,
  CalorieChartDataPoint,
  WeightChartDataPoint,
} from '../types';
import type { FoodLog, ExerciseLog, WeightLog, Profile } from '@/types/database';

/**
 * Hook managing history logs, date ranges, chart series, and daily accordion expansions.
 */
export function useHistory() {
  const supabase = createClient();

  const [rangeDays, setRangeDays] = useState<DateRange>(7);
  const [loading, setLoading] = useState(true);

  const [foodLogs, setFoodLogs] = useState<FoodLog[]>([]);
  const [exerciseLogs, setExerciseLogs] = useState<ExerciseLog[]>([]);
  const [weightLogs, setWeightLogs] = useState<WeightLog[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);

  const [expandedDay, setExpandedDay] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    const data = await fetchHistoryData(user.id, rangeDays);
    setProfile(data.profile);
    setFoodLogs(data.foodLogs);
    setExerciseLogs(data.exerciseLogs);
    setWeightLogs(data.weightLogs);
    setLoading(false);
  }, [supabase, rangeDays]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Aggregate day-by-day dataset for CalorieChart
  const defaultGoal = profile?.daily_calorie_goal ?? 2000;
  const daysList: string[] = [];
  const todayStr = todayISO();
  for (let i = rangeDays - 1; i >= 0; i--) {
    daysList.push(addDays(todayStr, -i));
  }

  const calorieChartData: CalorieChartDataPoint[] = daysList.map((iso) => {
    const dayFoods = foodLogs.filter((item) => item.logged_on === iso);
    const dayEx = exerciseLogs.filter((item) => item.logged_on === iso);

    const calsIn = Math.round(dayFoods.reduce((acc, curr) => acc + Number(curr.calories), 0));
    const calsOut = Math.round(dayEx.reduce((acc, curr) => acc + Number(curr.calories_burned), 0));

    const dateObj = new Date(iso);
    const displayDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    return {
      date: displayDate,
      caloriesIn: calsIn,
      caloriesOut: calsOut,
      goal: defaultGoal,
    };
  });

  const weightChartData: WeightChartDataPoint[] = weightLogs.map((item) => {
    const dateObj = new Date(item.logged_on);
    return {
      date: dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      weight: Number(item.weight_kg),
    };
  });

  const totalProtein = Math.round(foodLogs.reduce((acc, curr) => acc + Number(curr.protein_g ?? 0), 0));
  const totalCarbs = Math.round(foodLogs.reduce((acc, curr) => acc + Number(curr.carbs_g ?? 0), 0));
  const totalFat = Math.round(foodLogs.reduce((acc, curr) => acc + Number(curr.fat_g ?? 0), 0));

  const loggedDates = Array.from(new Set(foodLogs.map((l) => l.logged_on)));
  const loggedDaysCount = loggedDates.length;
  const totalCaloriesPeriod = foodLogs.reduce((acc, curr) => acc + Number(curr.calories), 0);
  const avgCaloriesPerLoggedDay = loggedDaysCount > 0 ? Math.round(totalCaloriesPeriod / loggedDaysCount) : 0;
  const totalBurnedPeriod = Math.round(exerciseLogs.reduce((acc, curr) => acc + Number(curr.calories_burned), 0));

  return {
    rangeDays,
    setRangeDays,
    loading,
    foodLogs,
    exerciseLogs,
    daysList,
    expandedDay,
    setExpandedDay,
    calorieChartData,
    weightChartData,
    totalProtein,
    totalCarbs,
    totalFat,
    loggedDates,
    loggedDaysCount,
    avgCaloriesPerLoggedDay,
    totalBurnedPeriod,
  };
}
