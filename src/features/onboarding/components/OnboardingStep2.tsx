/**
 * OnboardingStep2: Collects height, weight, and activity level and previews calculated BMR and TDEE.
 * Rendered inside OnboardingScreen.
 */

'use client';

import { Heart, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
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
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
        <Heart className="h-5 w-5 text-emerald-600" />
        <h2 className="font-bold text-gray-900">Body Stats & Activity</h2>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Height (cm)
          </label>
          <input
            type="number"
            min="50"
            max="260"
            value={heightCm}
            onChange={(e) => setHeightCm(Number(e.target.value))}
            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Weight (kg)
          </label>
          <input
            type="number"
            min="20"
            max="500"
            step="0.1"
            value={weightKg}
            onChange={(e) => setWeightKg(Number(e.target.value))}
            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1">
          Typical Daily Activity Level
        </label>
        <select
          value={activityLevel}
          onChange={(e) => setActivityLevel(e.target.value as ActivityLevel)}
          className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
        >
          <option value="sedentary">Sedentary (desk job, minimal exercise)</option>
          <option value="light">Lightly Active (light exercise 1-3 days/wk)</option>
          <option value="moderate">Moderately Active (moderate workout 3-5 days/wk)</option>
          <option value="active">Active (hard exercise 6-7 days/wk)</option>
          <option value="very_active">Very Active (physical labor or intensive training)</option>
        </select>
      </div>

      <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1 text-xs text-gray-600">
        <p className="flex justify-between">
          <span>Calculated BMR (Basal Metabolic Rate):</span>
          <strong className="text-gray-900">{bmr} kcal/day</strong>
        </p>
        <p className="flex justify-between">
          <span>Calculated TDEE (Maintenance):</span>
          <strong className="text-gray-900">{tdee} kcal/day</strong>
        </p>
      </div>

      <div className="pt-4 flex justify-between">
        <Button variant="ghost" onClick={onBack}>
          <ChevronLeft className="h-4 w-4 mr-1" /> Back
        </Button>
        <Button onClick={onNext}>
          Next: Goals <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}
