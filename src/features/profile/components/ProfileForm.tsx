/**
 * ProfileForm: Physical metrics and calorie target editing form with Mifflin-St Jeor sync and safety checks.
 * Rendered inside ProfileScreen.
 */

'use client';

import { User, RefreshCw, AlertTriangle, Loader2, Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import type { Gender, ActivityLevel, GoalType } from '../types';

interface ProfileFormProps {
  fullName: string;
  setFullName: (v: string) => void;
  dob: string;
  setDob: (v: string) => void;
  gender: Gender;
  setGender: (v: Gender) => void;
  heightCm: number;
  setHeightCm: (v: number) => void;
  weightKg: number;
  setWeightKg: (v: number) => void;
  activityLevel: ActivityLevel;
  setActivityLevel: (v: ActivityLevel) => void;
  goalType: GoalType;
  setGoalType: (v: GoalType) => void;
  calorieGoal: number;
  setCalorieGoal: (v: number) => void;
  recommendedGoal: number;
  floor: number;
  isBelowFloor: boolean;
  saving: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

export function ProfileForm({
  fullName,
  setFullName,
  dob,
  setDob,
  gender,
  setGender,
  heightCm,
  setHeightCm,
  weightKg,
  setWeightKg,
  activityLevel,
  setActivityLevel,
  goalType,
  setGoalType,
  calorieGoal,
  setCalorieGoal,
  recommendedGoal,
  floor,
  isBelowFloor,
  saving,
  onSubmit,
}: ProfileFormProps) {
  return (
    <div className="md:col-span-2 bg-white rounded-3xl border border-gray-100 p-6 shadow-sm space-y-5">
      <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
        <User className="h-5 w-5 text-emerald-600" />
        <h2 className="font-bold text-gray-900 text-base">Personal Details</h2>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Full Name</label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Date of Birth</label>
            <input
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Gender</label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value as Gender)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Height (cm)</label>
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
            <label className="block text-xs font-semibold text-gray-700 mb-1">Weight (kg)</label>
            <input
              type="number"
              step="0.1"
              min="20"
              max="500"
              value={weightKg}
              onChange={(e) => setWeightKg(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Activity Level</label>
            <select
              value={activityLevel}
              onChange={(e) => setActivityLevel(e.target.value as ActivityLevel)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
            >
              <option value="sedentary">Sedentary</option>
              <option value="light">Lightly Active</option>
              <option value="moderate">Moderately Active</option>
              <option value="active">Active</option>
              <option value="very_active">Very Active</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Goal Type</label>
            <select
              value={goalType}
              onChange={(e) => setGoalType(e.target.value as GoalType)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
            >
              <option value="lose">Fat Loss (-400 kcal)</option>
              <option value="maintain">Maintenance (0 kcal)</option>
              <option value="gain">Muscle Gain (+300 kcal)</option>
            </select>
          </div>
        </div>

        {/* Target Calorie Field with Sync button & Safety Floor Warning */}
        <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <span className="text-xs font-semibold text-emerald-800">Daily Calorie Target</span>
              <p className="text-xl font-bold text-emerald-900">{calorieGoal} kcal</p>
            </div>
            <button
              type="button"
              onClick={() => setCalorieGoal(recommendedGoal)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-white px-2.5 py-1.5 rounded-lg border border-emerald-200 shadow-2xs hover:bg-emerald-50"
              title="Reset to recommended Mifflin-St Jeor formula"
            >
              <RefreshCw className="h-3.5 w-3.5" /> Reset to Recommended ({recommendedGoal})
            </button>
          </div>

          <div>
            <label className="block text-[11px] text-gray-500 mb-1">Custom Daily Target (kcal, min {floor})</label>
            <input
              type="number"
              min={floor}
              max="10000"
              value={calorieGoal}
              onChange={(e) => setCalorieGoal(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
            />
          </div>

          {isBelowFloor && (
            <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
              <span>
                <strong>Below safety floor ({floor} kcal)!</strong> Nutritional guidelines require targets of at least {floor} kcal for {gender === 'female' ? 'women' : 'men'}. Goals below this floor cannot be saved.
              </span>
            </div>
          )}
        </div>

        <Button type="submit" disabled={saving || isBelowFloor} className="w-full">
          {saving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Check className="h-4 w-4 mr-1" />}
          Save Profile Changes
        </Button>
      </form>
    </div>
  );
}
