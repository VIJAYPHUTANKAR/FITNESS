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
        <h1 className="text-2xl font-heading font-bold text-ink">Activity Equivalents</h1>
        <p className="mt-1 text-sm text-ink/60">
          Estimated time for common activities to use {calories || 0} calories.
        </p>
      </div>

      {/* Prominent Psychological & Health Safety Disclaimer */}
      <div className="rounded-2xl border border-steel-200 bg-steel-50 p-4 text-xs text-ink/80 flex items-start gap-3 leading-relaxed">
        <ShieldAlert className="h-5 w-5 shrink-0 text-haldi-600 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold text-ink">Healthy Relationship with Exercise</p>
          <p>
            Exercise is not a way to make up for eating; if food, body weight, or exercise feels stressful or out of control, talk to a doctor or counselor. All numbers here are estimates.
          </p>
        </div>
      </div>

      {/* Missing weight prompt */}
      {!loadingProfile && profile && !profile.weight_kg && (
        <div className="flex items-start gap-3 rounded-xl border border-haldi-200 bg-haldi-50 p-4 text-sm text-haldi-900">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-haldi-700" />
          <span>
            Your profile is missing body weight. Results require body weight to compute MET calorie burn.{' '}
            <button
              className="underline font-semibold hover:text-haldi-950"
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
        <div className="flex items-start gap-3 rounded-2xl border border-haldi-200 bg-haldi-50 p-4 text-xs text-haldi-900 leading-relaxed">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-haldi-700" />
          <span>
            <strong>Daily safety cap reached (&gt;1,000 kcal/day or &gt;120 min/day):</strong> Plans exceeding 1,000 kcal/day or 120 minutes of daily activity cannot be saved. Please spread this plan across more days or lower the calorie target.
          </span>
        </div>
      )}

      {/* Results table */}
      {results.length > 0 ? (
        <div className="rounded-2xl border border-steel-200/80 bg-plate p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-heading font-semibold text-ink">Activity Duration Breakdown</h2>
            <button
              onClick={handleSavePlan}
              disabled={saving || isExceedingDailyCap}
              title={isExceedingDailyCap ? 'Cannot save: exceeds 1,000 kcal/day or 120 min/day' : undefined}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-ink bg-haldi-400 hover:bg-haldi-500 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg transition-colors"
            >
              <Bookmark className="h-3.5 w-3.5" />
              {saving ? 'Saving...' : 'Save this Plan'}
            </button>
          </div>

          <BurnTable results={results} days={days} onSavePlan={handleSavePlan} />
          {savedMsg && <p className="text-xs font-semibold text-patta-600">{savedMsg}</p>}
        </div>
      ) : calories > 0 && !profile?.weight_kg ? null : calories > 0 ? (
        <p className="py-6 text-center text-sm text-ink/50">Loading exercise data…</p>
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
      <div className="flex items-start gap-2 rounded-xl bg-steel-100/60 p-4 text-xs text-ink/60 border border-steel-200">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ink/40" />
        <p>
          Calculations use the Compendium of Physical Activities MET values. Individual metabolic rates, body composition, elevation, and intensity vary. Not medical advice.
        </p>
      </div>
    </div>
  );
}

export function BurnCalculatorScreen() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-ink/50">Loading calculator…</div>}>
      <BurnCalculatorInner />
    </Suspense>
  );
}
