'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { formatDate, todayISO, addDays } from '@/lib/utils';
import type { FoodLog, ExerciseLog, WeightLog, Profile } from '@/types/database';
import CalorieChart, { type CalorieChartDataPoint } from '@/components/CalorieChart';
import WeightChart, { type WeightChartDataPoint } from '@/components/WeightChart';
import MacroChart from '@/components/MacroChart';
import WeeklyStreak from '@/components/WeeklyStreak';
import {
  Loader2,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

type DateRange = 7 | 14 | 30;

export default function HistoryPage() {
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
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    // Compute date cutoff without UTC roundtrip
    const cutoffISO = addDays(todayISO(), -rangeDays);

    // 1. Profile for goal
    const { data: p } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    if (p) setProfile(p);

    // 2. Food logs in range
    const { data: f } = await supabase
      .from('food_logs')
      .select('*')
      .eq('user_id', user.id)
      .gte('logged_on', cutoffISO)
      .order('logged_on', { ascending: true });
    if (f) setFoodLogs(f);

    // 3. Exercise logs in range
    const { data: e } = await supabase
      .from('exercise_logs')
      .select('*')
      .eq('user_id', user.id)
      .gte('logged_on', cutoffISO)
      .order('logged_on', { ascending: true });
    if (e) setExerciseLogs(e);

    // 4. Weight logs in range
    const { data: w } = await supabase
      .from('weight_logs')
      .select('*')
      .eq('user_id', user.id)
      .gte('logged_on', cutoffISO)
      .order('logged_on', { ascending: true });
    if (w) setWeightLogs(w);

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

  // Weight chart data points
  const weightChartData: WeightChartDataPoint[] = weightLogs.map((item) => {
    const dateObj = new Date(item.logged_on);
    return {
      date: dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      weight: Number(item.weight_kg),
    };
  });

  // Macro totals for period
  const totalProtein = Math.round(foodLogs.reduce((acc, curr) => acc + Number(curr.protein_g ?? 0), 0));
  const totalCarbs   = Math.round(foodLogs.reduce((acc, curr) => acc + Number(curr.carbs_g ?? 0), 0));
  const totalFat     = Math.round(foodLogs.reduce((acc, curr) => acc + Number(curr.fat_g ?? 0), 0));

  // Unique days food was logged
  const loggedDates = Array.from(new Set(foodLogs.map((l) => l.logged_on)));

  // Averages
  const loggedDaysCount = loggedDates.length;
  const totalCaloriesPeriod = foodLogs.reduce((acc, curr) => acc + Number(curr.calories), 0);
  const avgCaloriesPerLoggedDay = loggedDaysCount > 0 ? Math.round(totalCaloriesPeriod / loggedDaysCount) : 0;
  const totalBurnedPeriod = Math.round(exerciseLogs.reduce((acc, curr) => acc + Number(curr.calories_burned), 0));

  return (
    <div className="mx-auto max-w-5xl p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header and Filter */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">History & Analytics</h1>
          <p className="text-xs text-gray-500 mt-1">
            Review past intake trends, expenditure, and weight progression.
          </p>
        </div>

        {/* Range Selector */}
        <div className="flex items-center gap-1.5 p-1 bg-white border border-gray-200 rounded-2xl shadow-2xs">
          {([7, 14, 30] as DateRange[]).map((r) => (
            <button
              key={r}
              onClick={() => setRangeDays(r)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all ${
                rangeDays === r
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              Last {r} days
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 text-emerald-600 animate-spin" />
        </div>
      ) : (
        <>
          {/* Top Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-1">
              <span className="text-[11px] font-semibold text-gray-400 uppercase">Avg Daily Intake</span>
              <p className="text-2xl font-bold text-gray-900">
                {avgCaloriesPerLoggedDay} <span className="text-xs font-normal text-gray-500">kcal</span>
              </p>
              <p className="text-[10px] text-gray-400">on days with logs</p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-1">
              <span className="text-[11px] font-semibold text-gray-400 uppercase">Total Workouts</span>
              <p className="text-2xl font-bold text-orange-600">
                {exerciseLogs.length} <span className="text-xs font-normal text-gray-500">sessions</span>
              </p>
              <p className="text-[10px] text-gray-400">{totalBurnedPeriod} kcal burned</p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-1">
              <span className="text-[11px] font-semibold text-gray-400 uppercase">Consistency</span>
              <p className="text-2xl font-bold text-emerald-600">
                {Math.round((loggedDaysCount / rangeDays) * 100)}%
              </p>
              <p className="text-[10px] text-gray-400">{loggedDaysCount} of {rangeDays} days logged</p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-2">
              <span className="text-[11px] font-semibold text-gray-400 uppercase">Current Streak</span>
              <WeeklyStreak loggedDates={loggedDates} />
            </div>
          </div>

          {/* Calorie Trend Chart */}
          <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-gray-900">Daily Intake vs Goal</h2>
                <p className="text-xs text-gray-500">Daily food intake (green) vs target goal (orange) vs burn (red)</p>
              </div>
              <span className="text-xs text-gray-400 italic">*estimated</span>
            </div>

            <CalorieChart data={calorieChartData} />
          </div>

          {/* Two-Column: Weight Progression & Macro Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Weight Progression */}
            <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm space-y-4">
              <div>
                <h2 className="text-base font-bold text-gray-900">Body Weight History</h2>
                <p className="text-xs text-gray-500">Recorded weigh-ins and trendline</p>
              </div>

              {weightChartData.length === 0 ? (
                <div className="text-center py-12 text-gray-400 text-xs">
                  No weigh-ins logged in this timeframe. Log your weight on the Profile page.
                </div>
              ) : (
                <WeightChart data={weightChartData} unit="kg" />
              )}
            </div>

            {/* Macro Breakdown */}
            <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm space-y-4">
              <div>
                <h2 className="text-base font-bold text-gray-900">Macronutrient Split</h2>
                <p className="text-xs text-gray-500">Aggregate protein, carbohydrate, and fat intake</p>
              </div>

              <MacroChart proteinG={totalProtein} carbsG={totalCarbs} fatG={totalFat} />
            </div>
          </div>

          {/* Daily Logs History Breakdown (Accordion) */}
          <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-gray-900">Daily Activity Breakdown</h2>

            <div className="divide-y divide-gray-100">
              {daysList.map((iso) => {
                const dayFoods = foodLogs.filter((f) => f.logged_on === iso);
                const dayExercises = exerciseLogs.filter((e) => e.logged_on === iso);
                const isExpanded = expandedDay === iso;

                const calsIn = Math.round(dayFoods.reduce((acc, curr) => acc + Number(curr.calories), 0));
                const calsOut = Math.round(dayExercises.reduce((acc, curr) => acc + Number(curr.calories_burned), 0));

                if (dayFoods.length === 0 && dayExercises.length === 0) {
                  return (
                    <div key={iso} className="py-2.5 flex items-center justify-between text-xs text-gray-400">
                      <span>{formatDate(iso)}</span>
                      <span>No entries logged</span>
                    </div>
                  );
                }

                return (
                  <div key={iso} className="py-3">
                    <button
                      onClick={() => setExpandedDay(isExpanded ? null : iso)}
                      className="w-full flex items-center justify-between text-left hover:text-emerald-700 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold text-gray-900">{formatDate(iso)}</span>
                        <span className="text-xs text-gray-500">
                          {dayFoods.length} foods • {dayExercises.length} workouts
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-xs font-bold text-emerald-700">+{calsIn} kcal</span>
                        {calsOut > 0 && <span className="text-xs font-bold text-orange-600">-{calsOut} kcal</span>}
                        {isExpanded ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="mt-3 pl-2 border-l-2 border-emerald-500 space-y-2 text-xs">
                        {dayFoods.length > 0 && (
                          <div>
                            <span className="font-semibold text-gray-700 block mb-1">Foods:</span>
                            <ul className="space-y-1">
                              {dayFoods.map((f) => (
                                <li key={f.id} className="flex justify-between text-gray-600">
                                  <span>{f.food_name} ({f.quantity_grams}g)</span>
                                  <span className="font-medium text-gray-800">{Math.round(Number(f.calories))} kcal</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {dayExercises.length > 0 && (
                          <div className="pt-1">
                            <span className="font-semibold text-gray-700 block mb-1">Workouts:</span>
                            <ul className="space-y-1">
                              {dayExercises.map((e) => (
                                <li key={e.id} className="flex justify-between text-gray-600">
                                  <span>{e.exercise_name} ({e.duration_min} min)</span>
                                  <span className="font-medium text-orange-600">-{Math.round(Number(e.calories_burned))} kcal</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
