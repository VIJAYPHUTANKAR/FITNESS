'use client';

import { AlertCircle, User } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
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
  const canContinue = Boolean(fullName.trim() && dob && !isMinor);

  return (
    <div className="space-y-5 text-left">
      <div className="flex items-center gap-2 pb-3 border-b border-[var(--color-border-subtle)]">
        <User className="h-4 w-4 text-[var(--color-haldi)]" />
        <h2 className="font-heading text-lg font-bold text-[var(--color-neel)]">
          Basic information
        </h2>
      </div>

      <div>
        <Input
          id="fullName"
          label="Full name"
          type="text"
          placeholder="e.g. Priya Sharma"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
        />
      </div>

      <div>
        <Input
          id="dob"
          label="Date of birth"
          type="date"
          value={dob}
          onChange={(e) => setDob(e.target.value)}
          required
          helperText={dob && !isMinor ? `Calculated age: ${age} years` : undefined}
        />
      </div>

      {/* Under 18 Guard Block */}
      {dob && isMinor && (
        <div className="p-3.5 bg-[var(--color-chukandar-subtle)] border border-[var(--color-chukandar)]/30 rounded-[12px] flex items-start gap-2.5 text-xs text-[var(--color-chukandar)] leading-relaxed">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Age gate: Adults only (18+)</p>
            <p className="mt-0.5 text-[11px]">
              Calculated age: {age} years. FitCalc is calibrated exclusively for adult physiology. Nutritional tracking for minors requires supervision from a pediatrician.
            </p>
          </div>
        </div>
      )}

      {/* Large tappable options for biological sex */}
      <div>
        <label className="block text-xs font-semibold text-[var(--color-neel)] mb-2">
          Biological sex (for metabolic BMR equations)
        </label>
        <div className="grid grid-cols-3 gap-2.5">
          {(
            [
              { id: 'female', label: 'Female', desc: '1,200 kcal floor' },
              { id: 'male', label: 'Male', desc: '1,500 kcal floor' },
              { id: 'other', label: 'Other', desc: '1,500 kcal floor' },
            ] as const
          ).map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setGender(item.id)}
              className={`p-3 text-left rounded-[12px] border transition-all duration-150 min-h-[56px] ${
                gender === item.id
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

      <div className="pt-2">
        <Button
          type="button"
          onClick={onNext}
          disabled={!canContinue}
          className="w-full"
        >
          Continue to body stats
        </Button>
      </div>
    </div>
  );
}
