'use client';

import * as React from 'react';
import { Info, X } from 'lucide-react';
import type { DashboardMetrics } from '../types';

interface NetEnergyBannerProps {
  metrics: DashboardMetrics;
}

export function NetEnergyBanner({ metrics }: NetEnergyBannerProps) {
  const [showInfo, setShowInfo] = React.useState(false);

  const {
    energyBalance,
    hasProfileMetrics,
    caloriesIn,
    baselineMaintenance,
    caloriesOut,
    bmr,
  } = metrics;

  return (
    <div className="w-full rounded-[16px] bg-[var(--color-plate)] border border-[var(--color-border)] p-4 text-left space-y-2">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs sm:text-sm text-[var(--color-neel)] leading-relaxed">
          <span className="font-semibold">Estimated Net Energy:</span>{' '}
          {hasProfileMetrics ? (
            <span className="tabular-nums font-bold">
              {energyBalance > 0 ? `+${energyBalance}` : energyBalance} kcal
            </span>
          ) : (
            <span className="text-[var(--color-neel-muted)]">Profile setup needed</span>
          )}{' '}
          <span className="text-xs text-[var(--color-neel-muted)] hidden sm:inline">
            (intake minus baseline maintenance and exercise)
          </span>
        </p>

        <button
          type="button"
          onClick={() => setShowInfo(!showInfo)}
          aria-expanded={showInfo}
          aria-label="Explain net energy formula"
          className="flex h-8 w-8 items-center justify-center rounded-[8px] text-[var(--color-neel-muted)] hover:bg-[var(--color-steel)] hover:text-[var(--color-neel)] transition-colors min-h-[36px] min-w-[36px] shrink-0"
        >
          {showInfo ? <X className="h-4 w-4" /> : <Info className="h-4 w-4" />}
        </button>
      </div>

      {showInfo && (
        <div className="pt-2 border-t border-[var(--color-border-subtle)] text-xs text-[var(--color-neel-muted)] space-y-1.5 leading-relaxed">
          {hasProfileMetrics ? (
            <>
              <p>
                Intake ({caloriesIn} kcal) &minus; [Baseline Maintenance ({baselineMaintenance} kcal) + Exercise ({caloriesOut} kcal)] ={' '}
                <strong className="text-[var(--color-neel)] tabular-nums">
                  {energyBalance > 0 ? `+${energyBalance}` : energyBalance} kcal
                </strong>
              </p>
              <p className="text-[11px] opacity-80">
                Baseline maintenance uses your BMR ({bmr} kcal) &times; 1.2 to prevent double-counting logged workout sessions.
              </p>
            </>
          ) : (
            <p className="text-[11px] text-[var(--color-chukandar)]">
              Please complete onboarding or set your height and weight in Profile to compute your physical baseline maintenance and net energy accurately.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
