/**
 * BurnCalculatorScreen: Activity equivalents calculator screen with auto-suggest pacing,
 * daily duration breakdown, and saved plans view. Rendered by src/app/(app)/burn-calculator/page.tsx.
 */

'use client';

import { Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldAlert, Info, AlertTriangle, Bookmark } from 'lucide-react';
import BurnTable from './BurnTable';
import { ActivityEquivalentsForm } from './ActivityEquivalentsForm';
import { SavedPlansList } from './SavedPlansList';
import { useBurnCalculator } from '../hooks/useBurnCalculator';

function BurnCalculatorInner() {
  const router = useRouter();
  const {
    calories,
    setCalories,
    days,
    setDays,
    profile,
    loadingProfile,
    results,
    isExceedingDailyCap,
    handleAutoSuggest,
    handleSavePlan,
    handleDeleteSavedPlan,
    saving,
    savedMsg,
    savedPlans,
  } = useBurnCalculator();

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Activity Equivalents</h1>
        <p className="mt-1 text-sm text-gray-500">
          Estimated time for common activities to use {calories || 0} calories.
        </p>
      </div>

      {/* Prominent Psychological & Health Safety Disclaimer */}
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 text-xs text-emerald-900 flex items-start gap-3 leading-relaxed">
        <ShieldAlert className="h-5 w-5 shrink-0 text-emerald-700 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold text-emerald-950">Healthy Relationship with Exercise</p>
          <p>
            Exercise is not a way to make up for eating. If food, body weight, or exercise feels stressful or out of control, talk to a doctor or counselor. All numbers here are estimates.
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
      <ActivityEquivalentsForm
        calories={calories}
        setCalories={setCalories}
        days={days}
        setDays={setDays}
        onAutoSuggest={handleAutoSuggest}
        canAutoSuggest={Boolean(profile?.weight_kg && calories > 0)}
      />

      {/* Extreme exercise / Cap exceeded warning */}
      {isExceedingDailyCap && (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-800 leading-relaxed">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
          <span>
            <strong>Daily safety cap reached (&gt;1,000 kcal/day or &gt;120 min/day):</strong> Plans exceeding 1,000 kcal/day or 120 minutes of daily activity cannot be saved. Please spread this plan across more days or lower the calorie target.
          </span>
        </div>
      )}

      {/* Results table */}
      {results.length > 0 ? (
        <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-gray-900">Activity Duration Breakdown</h2>
            <button
              onClick={handleSavePlan}
              disabled={saving || isExceedingDailyCap}
              title={isExceedingDailyCap ? 'Cannot save: exceeds 1,000 kcal/day or 120 min/day' : undefined}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg border border-emerald-200 transition-colors"
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

      {/* Saved Plans */}
      <SavedPlansList
        savedPlans={savedPlans}
        onLoadPlan={(cal, d) => {
          setCalories(cal);
          setDays(d);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onDeletePlan={handleDeleteSavedPlan}
      />

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

export function BurnCalculatorScreen() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-500">Loading calculator…</div>}>
      <BurnCalculatorInner />
    </Suspense>
  );
}
