/**
 * OnboardingStep1: Collects basic user details (name, date of birth, biological sex) and validates adult age.
 * Rendered inside OnboardingScreen.
 */

'use client';

import { User, AlertTriangle, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import type { Gender } from '@/lib/calc/bmr';

interface OnboardingStep1Props {
  fullName: string;
  setFullName: (val: string) => void;
  dob: string;
  setDob: (val: string) => void;
  gender: Gender;
  setGender: (val: Gender) => void;
  age: number;
  isMinor: boolean;
  onNext: () => void;
}

export function OnboardingStep1({
  fullName,
  setFullName,
  dob,
  setDob,
  gender,
  setGender,
  age,
  isMinor,
  onNext,
}: OnboardingStep1Props) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
        <User className="h-5 w-5 text-emerald-600" />
        <h2 className="font-bold text-gray-900">Basic Information</h2>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1">
          Full Name
        </label>
        <input
          type="text"
          placeholder="Gaurav Sharma"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1">
          Date of Birth
        </label>
        <input
          type="date"
          value={dob}
          onChange={(e) => setDob(e.target.value)}
          className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
        />
        <p className="text-[11px] text-gray-400 mt-1">Age: {age} years</p>
        {isMinor && (
          <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-1">
            <p className="font-semibold flex items-center gap-1.5 text-amber-800">
              <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600" />
              Designed for Adults (18+)
            </p>
            <p>
              FitCalc is designed for adults (18+). Calorie goals, restriction, and deficit targets can impact physical growth and development. If you are under 18, please consult a pediatrician or doctor with a parent or guardian.
            </p>
          </div>
        )}
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1">
          Biological Sex (for Mifflin-St Jeor metabolic formula)
        </label>
        <div className="grid grid-cols-3 gap-2">
          {(['male', 'female', 'other'] as Gender[]).map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => setGender(g)}
              className={`py-2 px-3 text-xs font-semibold rounded-xl border capitalize transition-all ${
                gender === g
                  ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                  : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      <div className="pt-4 flex justify-end">
        <Button onClick={onNext} disabled={isMinor}>
          Next: Body Stats <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}
