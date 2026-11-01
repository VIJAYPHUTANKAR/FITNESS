/**
 * SavedPlansList: Displays recently saved activity equivalent plans with load and delete actions.
 * Rendered inside BurnCalculatorScreen.
 */

'use client';

import { Bookmark, AlertTriangle, Trash2 } from 'lucide-react';
import type { BurnPlan, BurnResult } from '../types';

interface SavedPlansListProps {
  savedPlans: BurnPlan[];
  onLoadPlan: (calories: number, days: number) => void;
  onDeletePlan: (id: number) => void;
}

export function SavedPlansList({
  savedPlans,
  onLoadPlan,
  onDeletePlan,
}: SavedPlansListProps) {
  if (savedPlans.length === 0) return null;

  return (
    <div className="rounded-2xl border border-steel-200/80 bg-plate p-6 shadow-xs space-y-4">
      <div className="flex items-center gap-2 pb-2 border-b border-steel-200">
        <Bookmark className="h-4 w-4 text-haldi-600" />
        <h3 className="font-heading font-semibold text-ink text-sm">Your Saved Plans</h3>
      </div>

      <div className="divide-y divide-steel-100">
        {savedPlans.map((plan) => {
          const planItems = (plan.plan as unknown as BurnResult[]) || [];
          const hasPlanExtreme = planItems.some((item) => (item.minutesPerDay ?? item.minutes) > 120);

          return (
            <div key={plan.id} className="py-3 flex items-center justify-between gap-4 flex-wrap">
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-ink text-sm tabular-nums">
                    {plan.calories_to_burn} kcal over {plan.days} {plan.days === 1 ? 'day' : 'days'}
                  </p>
                  {hasPlanExtreme && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-haldi-100 text-haldi-900 border border-haldi-200">
                      <AlertTriangle className="h-3 w-3 text-haldi-700" /> &gt;120 min/day
                    </span>
                  )}
                </div>
                <p className="text-xs text-ink/50 mt-0.5">
                  Saved plan • {planItems.length} activities calculated
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onLoadPlan(plan.calories_to_burn, plan.days)}
                  className="px-2.5 py-1 text-xs font-semibold text-ink bg-steel-100 hover:bg-steel-200 rounded-lg transition-colors"
                >
                  Load
                </button>
                <button
                  onClick={() => onDeletePlan(plan.id)}
                  className="p-1 text-ink/40 hover:text-chukandar-600 rounded transition-colors"
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
  );
}
