'use client';

import { Target, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { NumberInput } from '@/components/ui/NumberInput';
import type { GoalType, Gender } from '@/lib/calc/bmr';

interface OnboardingStep3Props {
  goalType: GoalType;
  handleGoalTypeChange: (val: GoalType) => void;
  calorieGoal: number;
  setCalorieGoal: (val: number) => void;
  bmr: number;
  tdee: number;
  floor: number;
  gender: Gender;
  isBelowFloor: boolean;
  isMinor: boolean;
  saving: boolean;
  onBack: () => void;
  onFinish: () => void;
}

export function OnboardingStep3({
  goalType,
  handleGoalTypeChange,
  calorieGoal,
  setCalorieGoal,
  bmr,
  tdee,
  floor,
  gender,
  isBelowFloor,
  isMinor,
  saving,
  onBack,
  onFinish,
}: OnboardingStep3Props) {
  const canFinish = calorieGoal >= floor && !isMinor;

  return (
    <div className="space-y-5 text-left">
      <div className="flex items-center gap-2 pb-3 border-b border-[var(--color-border-subtle)]">
        <Target className="h-4 w-4 text-[var(--color-haldi)]" />
        <h2 className="font-heading text-lg font-bold text-[var(--color-neel)]">
          Your calorie goal
        </h2>
      </div>

      {/* Large tappable options for primary goal */}
      <div>
        <label className="block text-xs font-semibold text-[var(--color-neel)] mb-2">
          Primary focus
        </label>
        <div className="grid grid-cols-3 gap-2.5">
          {(
            [
              { id: 'lose', label: 'Fat Loss', desc: '-400 kcal deficit' },
              { id: 'maintain', label: 'Maintain', desc: 'At maintenance' },
              { id: 'gain', label: 'Gain Muscle', desc: '+300 kcal surplus' },
            ] as const
          ).map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => handleGoalTypeChange(item.id)}
              className={`p-3 text-left rounded-[12px] border transition-all duration-150 min-h-[56px] ${
                goalType === item.id
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

      {/* Target daily calories input */}
      <div>
        <NumberInput
          id="dailyCalorieGoal"
          label="Recommended daily calorie target"
          min={500}
          max={10000}
          value={calorieGoal || ''}
          onChange={(e) => setCalorieGoal(Number(e.target.value) || 0)}
          helperText={`Calculated from your TDEE (${tdee} kcal). You may adjust manually.`}
          required
        />
      </div>

      {/* Safety floor warning */}
      {isBelowFloor && (
        <div className="p-3.5 bg-[var(--color-chukandar-subtle)] border border-[var(--color-chukandar)]/30 rounded-[12px] flex items-start gap-2.5 text-xs text-[var(--color-chukandar)] leading-relaxed">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Below physiological safety floor</p>
            <p className="mt-0.5 text-[11px]">
              Minimum safe intake for your declared sex is {floor} kcal/day ({gender === 'female' ? '1,200 kcal for women' : '1,500 kcal for men'}). Calorie targets below this floor risk nutritional deficiencies and are blocked.
            </p>
          </div>
        </div>
      )}

      {/* Metric summary panel */}
      <div className="p-3.5 rounded-[12px] bg-[var(--color-steel)] border border-[var(--color-border)] space-y-2 text-xs">
        <div className="flex justify-between items-center text-[var(--color-neel-muted)]">
          <span>Basal Metabolic Rate (BMR):</span>
          <span className="font-semibold text-[var(--color-neel)] tabular-nums">{bmr} kcal</span>
        </div>
        <div className="flex justify-between items-center text-[var(--color-neel-muted)]">
          <span>Daily Maintenance (TDEE):</span>
          <span className="font-semibold text-[var(--color-neel)] tabular-nums">{tdee} kcal</span>
        </div>
        <div className="flex justify-between items-center pt-2 border-t border-[var(--color-border-subtle)]">
          <span className="font-bold text-[var(--color-neel)]">Daily Target:</span>
          <span className="font-heading font-extrabold text-base text-[var(--color-neel)] tabular-nums">
            {calorieGoal} kcal
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <Button type="button" variant="secondary" onClick={onBack} disabled={saving} className="w-1/3">
          Back
        </Button>
        <Button
          type="button"
          onClick={onFinish}
          disabled={!canFinish || saving}
          className="w-2/3"
        >
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
              Completing setup...
            </>
          ) : (
            'Complete setup'
          )}
        </Button>
      </div>
    </div>
  );
}
