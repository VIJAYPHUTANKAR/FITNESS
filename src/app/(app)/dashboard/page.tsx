import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { todayISO, formatDate } from '@/lib/utils';
import { surplusToFatKg } from '@/lib/calc/bmr';
import { CalorieRing } from '@/components/CalorieRing';
import { MacroBar } from '@/components/MacroBar';
import { DailySummaryCard } from '@/components/DailySummaryCard';
import {
  Utensils,
  Flame,
  Activity,
  Target,
  Plus,
  AlertCircle,
  ChevronRight,
  TrendingDown,
  Sparkles
} from 'lucide-react';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const today = todayISO();

  // Fetch profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  // Fetch today's food logs
  const { data: foodLogs } = await supabase
    .from('food_logs')
    .select('*')
    .eq('user_id', user.id)
    .eq('logged_on', today);

  // Fetch today's exercise logs
  const { data: exerciseLogs } = await supabase
    .from('exercise_logs')
    .select('*')
    .eq('user_id', user.id)
    .eq('logged_on', today);

  const logs = foodLogs ?? [];
  const exercises = exerciseLogs ?? [];

  // Calcs
  const caloriesIn = Math.round(logs.reduce((sum, item) => sum + Number(item.calories), 0));
  const caloriesOut = Math.round(exercises.reduce((sum, item) => sum + Number(item.calories_burned), 0));
  const goal = profile?.daily_calorie_goal ?? 2000;
  const netCalories = caloriesIn - caloriesOut;
  const surplus = caloriesIn - goal;
  const fatEquivalentKg = Math.abs(surplusToFatKg(surplus)).toFixed(2);

  // Macros
  const proteinG = Math.round(logs.reduce((sum, item) => sum + Number(item.protein_g ?? 0), 0));
  const carbsG = Math.round(logs.reduce((sum, item) => sum + Number(item.carbs_g ?? 0), 0));
  const fatG = Math.round(logs.reduce((sum, item) => sum + Number(item.fat_g ?? 0), 0));

  // Meals grouping
  const mealSections = [
    { type: 'breakfast', title: 'Breakfast', icon: '🌅' },
    { type: 'lunch', title: 'Lunch', icon: '☀️' },
    { type: 'dinner', title: 'Dinner', icon: '🌙' },
    { type: 'snack', title: 'Snacks', icon: '🍎' },
  ] as const;

  const needsOnboarding = !profile?.weight_kg || !profile?.daily_calorie_goal;

  return (
    <div className="mx-auto max-w-5xl p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Onboarding Banner if profile incomplete */}
      {needsOnboarding && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-amber-50 border border-amber-200">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-amber-900">Complete your profile for personalised goals</p>
              <p className="text-xs text-amber-700">Set your weight, height, and activity level to compute accurate BMR and burn targets.</p>
            </div>
          </div>
          <Link
            href="/onboarding"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-xl transition-colors shrink-0"
          >
            Start Setup <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">Today's Overview</h1>
          <p className="text-sm text-gray-500 mt-1">{formatDate(today)} • All values are estimated</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/log/food"
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-sm active:scale-95"
          >
            <Plus className="h-4 w-4" /> Log Food
          </Link>
          <Link
            href="/log/exercise"
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl transition-all shadow-sm active:scale-95"
          >
            <Activity className="h-4 w-4 text-emerald-600" /> Log Workout
          </Link>
        </div>
      </div>

      {/* Hero Stats Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
        {/* Calorie Ring */}
        <div className="flex flex-col items-center justify-center p-2 lg:border-r border-gray-100">
          <CalorieRing caloriesIn={caloriesIn} goal={goal} size={200} />
          <p className="text-xs text-gray-400 mt-2 font-medium">Estimated daily budget</p>
        </div>

        {/* Macros Breakdown */}
        <div className="flex flex-col justify-center space-y-4 lg:col-span-2">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Macronutrients</h2>
            <p className="text-xs text-gray-500">Distribution of today's logged calories</p>
          </div>
          <MacroBar proteinG={proteinG} carbsG={carbsG} fatG={fatG} />

          {/* Surplus / Deficit Notice */}
          <div className="mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-xl ${surplus > 0 ? 'bg-orange-100 text-orange-600' : 'bg-emerald-100 text-emerald-600'}`}>
                {surplus > 0 ? <Flame className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  {surplus > 0 ? `Surplus of ${surplus} kcal` : `${Math.abs(surplus)} kcal remaining under goal`}
                </p>
                <p className="text-xs text-gray-500">
                  {surplus > 0
                    ? `Roughly equivalent to ~${fatEquivalentKg} kg body fat if sustained over weeks`
                    : 'Great job maintaining your target range today!'}
                </p>
              </div>
            </div>

            {surplus > 0 && (
              <Link
                href={`/burn-calculator?surplus=${surplus}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors border border-emerald-200"
              >
                <Sparkles className="h-3.5 w-3.5" /> Calculate Burn Plan
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Quick Summary Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <DailySummaryCard
          icon={Utensils}
          label="Calories In"
          value={caloriesIn}
          unit="kcal"
          variant="emerald"
        />
        <DailySummaryCard
          icon={Activity}
          label="Burned (Exercise)"
          value={caloriesOut}
          unit="kcal"
          variant="orange"
        />
        <DailySummaryCard
          icon={Flame}
          label="Net Calories"
          value={netCalories}
          unit="kcal"
          variant={netCalories > goal ? 'red' : 'default'}
        />
        <DailySummaryCard
          icon={Target}
          label="Daily Goal"
          value={goal}
          unit="kcal"
          variant="default"
        />
      </div>

      {/* Meals of Today */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">Meals Logged Today</h2>
          <Link href="/log/food" className="text-xs font-semibold text-emerald-600 hover:text-emerald-700">
            View all / edit →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {mealSections.map(({ type, title, icon }) => {
            const mealItems = logs.filter((item) => item.meal_type === type);
            const mealCals = Math.round(mealItems.reduce((acc, curr) => acc + Number(curr.calories), 0));

            return (
              <div key={type} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{icon}</span>
                    <span className="font-semibold text-gray-900 text-sm">{title}</span>
                  </div>
                  <span className="text-xs font-semibold text-gray-500 bg-gray-50 px-2 py-1 rounded-md border border-gray-100">
                    {mealCals} kcal
                  </span>
                </div>

                {mealItems.length === 0 ? (
                  <p className="text-xs text-gray-400 italic py-2">No foods logged yet.</p>
                ) : (
                  <ul className="divide-y divide-gray-50 text-xs">
                    {mealItems.map((item) => (
                      <li key={item.id} className="py-1.5 flex justify-between items-center text-gray-700">
                        <span className="truncate pr-2 font-medium">{item.food_name}</span>
                        <span className="text-gray-400 shrink-0">{item.quantity_grams}g • <strong className="text-gray-800">{Math.round(Number(item.calories))} kcal</strong></span>
                      </li>
                    ))}
                  </ul>
                )}

                <Link
                  href={`/log/food?meal=${type}`}
                  className="block text-center text-xs font-medium text-emerald-600 hover:text-emerald-700 py-1.5 rounded-lg hover:bg-emerald-50 transition-colors"
                >
                  + Add to {title}
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
