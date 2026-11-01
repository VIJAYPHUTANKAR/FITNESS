/**
 * OnboardingStep3: Establishes primary goal (lose/maintain/gain) and verifies safety floor requirements.
 * Rendered inside OnboardingScreen.
 */

'use client';

import { Target, Sparkles, AlertTriangle, Info, ChevronLeft, Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
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
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
        <Target className="h-5 w-5 text-emerald-600" />
        <h2 className="font-bold text-gray-900">Your Calorie Goal</h2>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-2">
          What is your primary goal?
        </label>
        <div className="grid grid-cols-3 gap-2">
          {[
            { id: 'lose', label: 'Fat Loss', desc: '-400 kcal below maintenance' },
            { id: 'maintain', label: 'Maintain', desc: 'At maintenance' },
            { id: 'gain', label: 'Gain Muscle', desc: '+300 kcal above maintenance' },
          ].map(({ id, label, desc }) => (
            <button
              key={id}
              type="button"
              onClick={() => handleGoalTypeChange(id as GoalType)}
              className={`p-3 text-left rounded-2xl border transition-all ${
                goalType === id
                  ? 'border-emerald-600 bg-emerald-50 text-emerald-900'
                  : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              <p className="font-bold text-xs">{label}</p>
              <p className="text-[10px] text-gray-500 mt-0.5">{desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Target Card */}
      <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs text-emerald-700 font-semibold uppercase tracking-wider">
              Recommended Daily Target
            </span>
            <p className="text-3xl font-extrabold text-emerald-900 mt-1">
              {calorieGoal} <span className="text-sm font-normal text-emerald-700">kcal / day</span>
            </p>
          </div>
          <Sparkles className="h-8 w-8 text-emerald-500 shrink-0" />
        </div>
        <p className="text-xs text-emerald-800">
          Formula recommendation: BMR {bmr} &times; Activity multiplier = TDEE {tdee} kcal.
        </p>
      </div>

      {/* Manual Override option */}
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1">
          Customize Calorie Target (Optional)
        </label>
        <input
          type="number"
          min={floor}
          max="10000"
          value={calorieGoal}
          onChange={(e) => setCalorieGoal(Number(e.target.value))}
          className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
        />

        {/* Safety Floor Warning */}
        {isBelowFloor && (
          <div className="mt-2 p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
            <span>
              <strong>Below safety floor ({floor} kcal)!</strong> Guidelines require a minimum intake of {floor} kcal for {gender === 'female' ? 'women' : 'men'}. Targets below this floor cannot be saved.
            </span>
          </div>
        )}
      </div>

      <div className="p-3 bg-gray-50 rounded-xl flex items-start gap-2 text-xs text-gray-500">
        <Info className="h-4 w-4 shrink-0 text-gray-400 mt-0.5" />
        <span>
          Disclaimer: All calorie guidelines are estimates and for informational purposes only. Consult a physician or registered dietitian before starting any aggressive regimen.
        </span>
      </div>

      <div className="pt-4 flex justify-between">
        <Button variant="ghost" onClick={onBack} disabled={saving}>
          <ChevronLeft className="h-4 w-4 mr-1" /> Back
        </Button>
        <Button onClick={onFinish} disabled={saving || isBelowFloor || isMinor} className="px-6">
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> Saving...
            </>
          ) : (
            <>
              <CheckCircle2 className="h-4 w-4 mr-1.5" /> Complete Setup
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
