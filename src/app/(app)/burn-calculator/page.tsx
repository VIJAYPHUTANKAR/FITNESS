'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { AlertTriangle, Info, Link as LinkIcon } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import {
  calculateBurnPlan,
  suggestDays,
  type BurnResult,
  type Exercise,
} from '@/lib/calc/burn';
import BurnTable from '@/components/BurnTable';
import type { Profile } from '@/types/database';

const FAT_KCAL_PER_GRAM = 9 * 1.1; // ~9 kcal/g fat, rounded to ~7700 kcal/kg => 7.7 per gram

function fatGrams(kcal: number): number {
  return Math.round(kcal / 7.7);
}

// ─── Inner page (uses useSearchParams) ───────────────────────────────────────

function BurnCalculatorInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const supabase = createClient();

  const surplusParam = searchParams.get('surplus');
  const [calories, setCalories] = useState<number>(
    surplusParam ? Math.max(0, Math.round(Number(surplusParam))) : 0,
  );
  const [days, setDays] = useState<number>(1);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [results, setResults] = useState<BurnResult[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState('');

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

  const hasExtreme = results.some((r) => (r.minutesPerDay ?? r.minutes) > 90);

  const handleSavePlan = useCallback(async () => {
    if (!profile) return;
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
      calories_to_burn: calories,
      days,
      plan: results as unknown as import('@/types/database').Json,
    });
    setSaving(false);
    if (!error) setSavedMsg('Plan saved!');
  }, [supabase, profile, calories, days, results]);

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Burn Calculator</h1>
        <p className="mt-1 text-sm text-gray-500">
          Find out how much exercise you need to burn off a calorie surplus.
        </p>
      </div>

      {/* Missing weight prompt */}
      {!loadingProfile && profile && !profile.weight_kg && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          <Info className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            Your profile is missing a body weight. Results require weight to calculate calorie burn.{' '}
            <button
              className="underline hover:text-amber-900"
              onClick={() => router.push('/profile')}
            >
              Set your weight →
            </button>
          </span>
        </div>
      )}

      {/* Inputs */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="grid gap-5 sm:grid-cols-2">
          {/* Calories input */}
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-gray-700" htmlFor="calories">
              Calories to Burn (kcal)
            </label>
            <input
              id="calories"
              type="number"
              min={0}
              step={50}
              value={calories || ''}
              onChange={(e) => setCalories(Math.max(0, Number(e.target.value)))}
              placeholder="e.g. 500"
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* Days spinner */}
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-gray-700" htmlFor="days">
              Spread across N days
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
                className="w-24 rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              <button
                type="button"
                onClick={handleAutoSuggest}
                disabled={!profile?.weight_kg || calories <= 0}
                className="rounded-lg border border-emerald-600 px-3 py-2.5 text-sm font-medium text-emerald-700 transition-colors hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Auto-suggest
              </button>
            </div>
          </div>
        </div>

        {/* Fat equivalent */}
        {calories > 0 && (
          <p className="mt-4 text-sm text-gray-600">
            <span className="font-medium">{calories} kcal</span> ≈{' '}
            <span className="font-medium text-emerald-700">{fatGrams(calories)} g</span> of body fat{' '}
            <span className="text-gray-400">(rough estimate)</span>
          </p>
        )}
      </div>

      {/* Extreme exercise warning */}
      {hasExtreme && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            <strong>This is extreme exercise.</strong> Consider spreading over more days or adjusting
            your diet.
          </span>
        </div>
      )}

      {/* Results table */}
      {results.length > 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-base font-semibold text-gray-900">Exercise Plan</h2>
          <BurnTable results={results} days={days} onSavePlan={handleSavePlan} />
          {saving && <p className="mt-2 text-sm text-gray-500">Saving…</p>}
          {savedMsg && <p className="mt-2 text-sm font-medium text-emerald-600">{savedMsg}</p>}
        </div>
      ) : calories > 0 && !profile?.weight_kg ? null : calories > 0 ? (
        <p className="py-6 text-center text-sm text-gray-400">Loading exercises…</p>
      ) : null}

      {/* Disclaimer */}
      <div className="flex items-start gap-2 rounded-lg bg-gray-50 p-4 text-xs text-gray-500">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        <p>
          These are estimates based on the MET method and your body weight. Actual burn varies with
          fitness level, intensity, and individual metabolism. This is not medical advice.
        </p>
      </div>
    </div>
  );
}

// ─── Page wrapper with Suspense (required for useSearchParams) ────────────────

export default function BurnCalculatorPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-500">Loading…</div>}>
      <BurnCalculatorInner />
    </Suspense>
  );
}
