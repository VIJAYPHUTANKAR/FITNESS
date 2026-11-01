'use client';

import { Activity } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { NumberInput } from '@/components/ui/NumberInput';
import type { ActivityLevel } from '@/lib/calc/bmr';

interface OnboardingStep2Props {
  heightCm: number;
  setHeightCm: (val: number) => void;
  weightKg: number;
  setWeightKg: (val: number) => void;
  activityLevel: ActivityLevel;
  setActivityLevel: (val: ActivityLevel) => void;
  bmr: number;
  tdee: number;
  onBack: () => void;
  onNext: () => void;
}

export function OnboardingStep2({
  heightCm,
  setHeightCm,
  weightKg,
  setWeightKg,
  activityLevel,
  setActivityLevel,
  bmr,
  tdee,
  onBack,
  onNext,
}: OnboardingStep2Props) {
  const canContinue = heightCm >= 50 && weightKg >= 20;

  return (
    <div className="space-y-5 text-left">
      <div className="flex items-center gap-2 pb-3 border-b border-[var(--color-border-subtle)]">
        <Activity className="h-4 w-4 text-[var(--color-haldi)]" />
        <h2 className="font-heading text-lg font-bold text-[var(--color-neel)]">
          Body stats & activity
        </h2>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <NumberInput
            id="heightCm"
            label="Height (cm)"
            min={50}
            max={300}
            value={heightCm || ''}
            onChange={(e) => setHeightCm(Number(e.target.value) || 0)}
            required
          />
        </div>

        <div>
          <NumberInput
            id="weightKg"
            label="Weight (kg)"
            min={20}
            max={500}
            step={0.1}
            value={weightKg || ''}
            onChange={(e) => setWeightKg(Number(e.target.value) || 0)}
            required
          />
        </div>
      </div>

      {/* Large tappable options for Activity Level */}
      <div>
        <label className="block text-xs font-semibold text-[var(--color-neel)] mb-2">
          Daily lifestyle activity
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {(
            [
              { id: 'sedentary', label: 'Sedentary', desc: 'Desk job, little to no workout (1.2×)' },
              { id: 'light', label: 'Lightly active', desc: '1–3 workout sessions per week (1.375×)' },
              { id: 'moderate', label: 'Moderately active', desc: '3–5 workout sessions per week (1.55×)' },
              { id: 'very_active', label: 'Very active', desc: '6–7 intense workout days per week (1.725×)' },
            ] as const
          ).map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setActivityLevel(item.id)}
              className={`p-3 text-left rounded-[12px] border transition-all duration-150 min-h-[56px] ${
                activityLevel === item.id
                  ? 'border-[var(--color-neel)] bg-[var(--color-steel)] text-[var(--color-neel)] font-bold'
                  : 'border-[var(--color-border)] bg-[var(--color-plate)] text-[var(--color-neel-muted)] hover:bg-[var(--color-steel)]'
              }`}
            >
              <p className="text-xs font-semibold">{item.label}</p>
              <p className="text-[10px] opacity-75 mt-0.5">{item.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Live BMR & TDEE preview */}
      <div className="grid grid-cols-2 gap-3 p-3.5 rounded-[12px] bg-[var(--color-steel)] border border-[var(--color-border)] text-center">
        <div>
          <span className="text-[10px] font-semibold text-[var(--color-neel-muted)] uppercase tracking-wider">
            Basal Metabolic Rate
          </span>
          <p className="font-heading font-extrabold text-base text-[var(--color-neel)] tabular-nums mt-0.5">
            {bmr} <span className="text-[10px] font-normal text-[var(--color-neel-muted)]">kcal</span>
          </p>
        </div>
        <div>
          <span className="text-[10px] font-semibold text-[var(--color-neel-muted)] uppercase tracking-wider">
            Maintenance TDEE
          </span>
          <p className="font-heading font-extrabold text-base text-[var(--color-neel)] tabular-nums mt-0.5">
            {tdee} <span className="text-[10px] font-normal text-[var(--color-neel-muted)]">kcal</span>
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <Button type="button" variant="secondary" onClick={onBack} className="w-1/3">
          Back
        </Button>
        <Button
          type="button"
          onClick={onNext}
          disabled={!canContinue}
          className="w-2/3"
        >
          Continue to goal
        </Button>
      </div>
    </div>
  );
}
