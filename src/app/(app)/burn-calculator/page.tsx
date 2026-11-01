'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { AlertTriangle, Info, Sparkles, Bookmark, Calendar, Trash2, ShieldAlert } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import {
  calculateBurnPlan,
  suggestDays,
  formatDuration,
  type BurnResult,
  type Exercise,
} from '@/lib/calc/burn';
import { surplusToFatKg } from '@/lib/calc/bmr';
import { formatSupabaseError } from '@/lib/utils';
import { BurnPlanFormSchema } from '@/lib/validation/schemas';
import BurnTable from '@/components/BurnTable';
import type { Profile, BurnPlan } from '@/types/database';

function BurnCalculatorInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const supabase = createClient();

  const surplusParam = searchParams.get('surplus');
  const [calories, setCalories] = useState<number>(
    surplusParam ? Math.max(0, Math.round(Number(surplusParam))) : 500,
  );
  const [days, setDays] = useState<number>(1);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [results, setResults] = useState<BurnResult[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState('');
  const [savedPlans, setSavedPlans] = useState<BurnPlan[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(true);

  // Load user profile
  useEffect(() => {
    async function loadProfile() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      setProfile(data);
      setLoadingProfile(false);
    }
    loadProfile();
  }, [supabase]);

  // Load exercises
  useEffect(() => {
    async function loadExercises() {
      const { data } = await supabase
        .from('exercises')
        .select('*')
        .order('name');
      if (data) setExercises(data as Exercise[]);
    }
    loadExercises();
  }, [supabase]);

  // Load saved plans
  const loadSavedPlans = useCallback(async () => {
    setLoadingPlans(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setLoadingPlans(false);
      return;
    }
    const { data } = await supabase
      .from('burn_plans')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5);

    if (data) setSavedPlans(data);
    setLoadingPlans(false);
  }, [supabase]);

  useEffect(() => {
    loadSavedPlans();
  }, [loadSavedPlans]);

  // Recalculate results whenever inputs change
  useEffect(() => {
    if (calories > 0 && profile?.weight_kg && exercises.length > 0) {
      const plan = calculateBurnPlan(calories, profile.weight_kg, exercises, days);
      setResults(plan);
    } else {
      setResults([]);
    }
  }, [calories, days, exercises, profile]);

  const handleAutoSuggest = useCallback(() => {
    if (!profile?.weight_kg || exercises.length === 0 || calories <= 0) return;
    const suggested = suggestDays(calories, profile.weight_kg, exercises);
    setDays(suggested);
  }, [calories, profile, exercises]);

  const hasExtreme = results.some((r) => r.isUnrealistic);
  const fatEquivalentG = Math.round(surplusToFatKg(calories) * 1000);

  const handleSavePlan = useCallback(async () => {
    if (!profile || results.length === 0) return;

    const validation = BurnPlanFormSchema.safeParse({
      calories_to_burn: calories,
      days,
      plan: results,
    });

    if (!validation.success) {
      setSavedMsg(validation.error.issues[0]?.message || 'Invalid plan configuration.');
      return;
    }

    setSaving(true);
    setSavedMsg('');
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setSaving(false);
      return;
    }
    const { error } = await supabase.from('burn_plans').insert({
      user_id: user.id,
      calories_to_burn: validation.data.calories_to_burn,
      days: validation.data.days,
      plan: results as unknown as import('@/types/database').Json,
    });
    setSaving(false);
    if (!error) {
      setSavedMsg('Plan saved successfully!');
      loadSavedPlans();
      setTimeout(() => setSavedMsg(''), 4000);
    } else {
      setSavedMsg(formatSupabaseError(error));
    }
  }, [supabase, profile, calories, days, results, loadSavedPlans]);

  async function handleDeleteSavedPlan(planId: number) {
    await supabase.from('burn_plans').delete().eq('id', planId);
    loadSavedPlans();
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Burn Calculator</h1>
        <p className="mt-1 text-sm text-gray-500">
          Calculate physical exercise duration to balance calorie intake based on verified MET formulas.
        </p>
      </div>

      {/* Prominent Psychological & Health Safety Disclaimer */}
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 text-xs text-emerald-900 flex items-start gap-3 leading-relaxed">
        <ShieldAlert className="h-5 w-5 shrink-0 text-emerald-700 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold text-emerald-950">Healthy Relationship with Exercise</p>
          <p>
            Exercise is for cardiovascular fitness, strength, and mental well-being—<strong>not a tool to punish or compensate for eating</strong>. All numbers here are estimates. If you accumulated a large calorie intake, the healthiest path is simply returning to your normal balanced nutrition rather than over-exercising.
          </p>
        </div>
      </div>

      {/* Missing weight prompt */}
      {!loadingProfile && profile && !profile.weight_kg && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          <Info className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            Your profile is missing body weight. Results require body weight to compute MET calorie burn.{' '}
            <button
              className="underline font-semibold hover:text-amber-900"
              onClick={() => router.push('/profile')}
            >
              Set your weight now →
            </button>
          </span>
        </div>
      )}

      {/* Inputs */}
      <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm space-y-4">
        <div className="grid gap-5 sm:grid-cols-2">
          {/* Calories input */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-gray-700" htmlFor="calories">
              Calories to Burn (kcal)
            </label>
            <input
              id="calories"
              type="number"
              min={1}
              max={20000}
              step={50}
              value={calories || ''}
              onChange={(e) => setCalories(Math.max(0, Math.min(20000, Number(e.target.value))))}
              placeholder="e.g. 500"
              className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
            {calories > 5000 && (
              <p className="mt-1.5 text-xs text-amber-600 font-medium">
                ⚠️ Burning &gt;5,000 kcal is extreme for a single session. Auto-suggest will spread this over multiple days.
              </p>
            )}
          </div>

          {/* Days spinner */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-gray-700" htmlFor="days">
              Spread across N days (1 - 30)
            </label>
            <div className="flex items-center gap-2">
              <input
                id="days"
                type="number"
                min={1}
                max={30}
                value={days}
                onChange={(e) =>
                  setDays(Math.min(30, Math.max(1, Number(e.target.value))))
                }
                className="w-24 rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              <button
                type="button"
                onClick={handleAutoSuggest}
                disabled={!profile?.weight_kg || calories <= 0}
                className="rounded-xl border border-emerald-600 px-3.5 py-2.5 text-xs font-semibold text-emerald-700 transition-colors hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Auto-suggest Safe Pace
              </button>
            </div>
          </div>
        </div>

        {/* Fat equivalent */}
        {calories > 0 && (
          <div className="pt-2 border-t border-gray-50 flex items-center justify-between text-xs text-gray-600 flex-wrap gap-2">
            <p>
              Energy: <strong className="text-gray-900">{calories} kcal</strong> ≈{' '}
              <strong className="text-emerald-700">{fatEquivalentG} g</strong> of body fat equivalent{' '}
              <span className="text-gray-400">(rough approximation: 7,700 kcal ≈ 1 kg fat)</span>
            </p>
            {days > 1 && (
              <p className="text-gray-500">
                Paced at <strong className="text-gray-800">{Math.round(calories / days)} kcal/day</strong> across {days} days
              </p>
            )}
          </div>
        )}
      </div>

      {/* Extreme exercise warning (>120 min/day) */}
      {hasExtreme && (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-800 leading-relaxed">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
          <span>
            <strong>Extreme exertion flagged (&gt;120 min/day):</strong> One or more activities require more than 2 hours per day. We strongly suggest spreading this plan over more days or achieving your calorie deficit primarily via nutrition.
          </span>
        </div>
      )}

      {/* Results table */}
      {results.length > 0 ? (
        <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-gray-900">Exercise Duration Breakdown</h2>
            <button
              onClick={handleSavePlan}
              disabled={saving}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200 transition-colors"
            >
              <Bookmark className="h-3.5 w-3.5" />
              {saving ? 'Saving...' : 'Save this Plan'}
            </button>
          </div>

          <BurnTable results={results} days={days} onSavePlan={handleSavePlan} />
          {savedMsg && <p className="text-xs font-semibold text-emerald-600">{savedMsg}</p>}
        </div>
      ) : calories > 0 && !profile?.weight_kg ? null : calories > 0 ? (
        <p className="py-6 text-center text-sm text-gray-400">Loading exercise data…</p>
      ) : null}

      {/* Saved Plans View with 120min flag */}
      {savedPlans.length > 0 && (
        <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
            <Bookmark className="h-4 w-4 text-emerald-600" />
            <h3 className="font-bold text-gray-900 text-sm">Your Saved Plans</h3>
          </div>

          <div className="divide-y divide-gray-100">
            {savedPlans.map((plan) => {
              const planItems = (plan.plan as unknown as BurnResult[]) || [];
              const hasPlanExtreme = planItems.some((item) => (item.minutesPerDay ?? item.minutes) > 120);

              return (
                <div key={plan.id} className="py-3 flex items-center justify-between gap-4 flex-wrap">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-gray-900 text-sm">
                        {plan.calories_to_burn} kcal over {plan.days} {plan.days === 1 ? 'day' : 'days'}
                      </p>
                      {hasPlanExtreme && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                          <AlertTriangle className="h-3 w-3 text-amber-600" /> &gt;120 min/day
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Saved plan • {planItems.length} activities calculated
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setCalories(plan.calories_to_burn);
                        setDays(plan.days);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg"
                    >
                      Load
                    </button>
                    <button
                      onClick={() => handleDeleteSavedPlan(plan.id)}
                      className="p-1 text-gray-400 hover:text-red-600 rounded"
                      title="Delete saved plan"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Medical disclaimer note */}
      <div className="flex items-start gap-2 rounded-xl bg-gray-50 p-4 text-xs text-gray-500">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gray-400" />
        <p>
          Calculations use the Compendium of Physical Activities MET values. Individual metabolic rates, body composition, elevation, and intensity vary. Not medical advice.
        </p>
      </div>
    </div>
  );
}

export default function BurnCalculatorPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-500">Loading calculator…</div>}>
      <BurnCalculatorInner />
    </Suspense>
  );
}
