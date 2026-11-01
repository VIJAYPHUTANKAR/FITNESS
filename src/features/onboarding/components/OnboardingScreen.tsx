'use client';

import { AlertCircle } from 'lucide-react';
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
    <div className="mx-auto max-w-xl p-4 sm:p-6 lg:p-8 space-y-6 text-[var(--color-neel)]">
      {/* Progress Header */}
      <div className="space-y-3 text-center">
        <h1 className="font-heading text-2xl sm:text-3xl font-bold text-[var(--color-neel)]">
          Set up your nutrition profile
        </h1>
        <p className="text-xs text-[var(--color-neel-muted)]">
          Step {step} of 3 · Calibrated for accurate BMR, TDEE, and safe daily calorie targets
        </p>

        {/* Plain progress bar */}
        <div className="w-full max-w-xs mx-auto h-1.5 rounded-full bg-[var(--color-border)] overflow-hidden">
          <div
            className="h-full bg-[var(--color-neel)] transition-all duration-300"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>
      </div>

      <div className="bg-[var(--color-plate)] rounded-[20px] border border-[var(--color-border)] p-6 sm:p-8 shadow-xs space-y-6">
        {error && (
          <div className="p-3 text-xs bg-[var(--color-chukandar-subtle)] border border-[var(--color-chukandar)]/20 text-[var(--color-chukandar)] rounded-[10px] flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span className="font-medium">{error}</span>
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
