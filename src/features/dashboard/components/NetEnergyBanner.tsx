/**
 * NetEnergyBanner: Visual indicator of net caloric surplus or deficit based on BMR baseline
 * maintenance and logged workout expenditure. Rendered inside DashboardScreen.
 */

import { Flame, TrendingDown, Info } from 'lucide-react';
import type { DashboardMetrics } from '../types';

interface NetEnergyBannerProps {
  metrics: DashboardMetrics;
}

export function NetEnergyBanner({ metrics }: NetEnergyBannerProps) {
  const {
    energyBalance,
    hasProfileMetrics,
    vsGoal,
    goal,
    caloriesIn,
    baselineMaintenance,
    caloriesOut,
    bmr,
  } = metrics;

  return (
    <div className="mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div className="flex items-start gap-3">
          <div
            className={`p-2.5 rounded-xl shrink-0 ${
              energyBalance > 0
                ? 'bg-orange-100 text-orange-600'
                : 'bg-emerald-100 text-emerald-600'
            }`}
          >
            {energyBalance > 0 ? (
              <Flame className="h-5 w-5" />
            ) : (
              <TrendingDown className="h-5 w-5" />
            )}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Estimated Net Energy (baseline + logged exercise)
              </span>
              {hasProfileMetrics ? (
                energyBalance > 0 ? (
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-orange-100 text-orange-800">
                    Surplus: +{energyBalance} kcal
                  </span>
                ) : (
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    Deficit: {energyBalance} kcal
                  </span>
                )
              ) : (
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                  Profile metrics needed
                </span>
              )}
            </div>

            <p className="text-sm font-semibold text-gray-900">
              {vsGoal > 0
                ? `${vsGoal} kcal over daily goal (${goal} kcal)`
                : `${Math.abs(vsGoal)} kcal remaining of daily goal (${goal} kcal)`}
            </p>

            {hasProfileMetrics ? (
              <div className="text-xs text-gray-500 leading-relaxed space-y-1">
                <p>
                  Intake ({caloriesIn} kcal) &minus; [Baseline Maintenance ({baselineMaintenance} kcal) + Exercise ({caloriesOut} kcal)] ={' '}
                  <strong>{energyBalance > 0 ? `+${energyBalance} kcal` : `${energyBalance} kcal`}</strong>
                </p>
                <div className="flex items-center gap-1 text-[11px] text-gray-400">
                  <Info className="h-3.5 w-3.5 shrink-0" />
                  <span>
                    Baseline maintenance is BMR ({bmr} kcal) &times; 1.2 (sedentary baseline, avoiding double-counting workouts).
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-amber-700">
                Please complete onboarding to compute your physical baseline maintenance and energy surplus accurately.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
