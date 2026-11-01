/**
 * OnboardingScreen: Multi-step wizard guiding new users through profile setup, BMR/TDEE math,
 * and safe calorie goal configuration. Rendered by src/app/(app)/onboarding/page.tsx.
 */

'use client';

import { AlertTriangle } from 'lucide-react';
import { useOnboarding } from '../hooks/useOnboarding';
import { OnboardingStep1 } from './OnboardingStep1';
import { OnboardingStep2 } from './OnboardingStep2';
import { OnboardingStep3 } from './OnboardingStep3';

export function OnboardingScreen() {
  const {
    step,
    setStep,
    saving,
    error,
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
    calorieGoal,
    setCalorieGoal,
    age,
    isMinor,
    bmr,
    tdee,
    floor,
    isBelowFloor,
    handleGoalTypeChange,
    handleFinish,
  } = useOnboarding();

  return (
    <div className="mx-auto max-w-xl p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Progress Header */}
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold text-gray-900">Personalise Your Journey</h1>
        <p className="text-xs text-gray-500">
          Step {step} of 3 • Accurate metrics compute your BMR, TDEE, and safe calorie targets
        </p>

        {/* Step dots */}
        <div className="flex items-center justify-center gap-2 pt-2">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-2 rounded-full transition-all duration-300 ${
                s === step
                  ? 'w-8 bg-emerald-600'
                  : s < step
                  ? 'w-2 bg-emerald-300'
                  : 'w-2 bg-gray-200'
              }`}
            />
          ))}
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-sm space-y-6">
        {error && (
          <div className="p-3 text-xs bg-red-50 text-red-600 rounded-xl flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {step === 1 && (
          <OnboardingStep1
            fullName={fullName}
            setFullName={setFullName}
            dob={dob}
            setDob={setDob}
            gender={gender}
            setGender={setGender}
            age={age}
            isMinor={isMinor}
            onNext={() => setStep(2)}
          />
        )}

        {step === 2 && (
          <OnboardingStep2
            heightCm={heightCm}
            setHeightCm={setHeightCm}
            weightKg={weightKg}
            setWeightKg={setWeightKg}
            activityLevel={activityLevel}
            setActivityLevel={setActivityLevel}
            bmr={bmr}
            tdee={tdee}
            onBack={() => setStep(1)}
            onNext={() => setStep(3)}
          />
        )}

        {step === 3 && (
          <OnboardingStep3
            goalType={goalType}
            handleGoalTypeChange={handleGoalTypeChange}
            calorieGoal={calorieGoal}
            setCalorieGoal={setCalorieGoal}
            bmr={bmr}
            tdee={tdee}
            floor={floor}
            gender={gender}
            isBelowFloor={isBelowFloor}
            isMinor={isMinor}
            saving={saving}
            onBack={() => setStep(2)}
            onFinish={handleFinish}
          />
        )}
      </div>
    </div>
  );
}
