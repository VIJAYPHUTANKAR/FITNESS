'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import {
  calculateBMR,
  calculateTDEE,
  calculateCalorieGoal,
  getCalorieGoalFloor,
  ageFromDOB,
  type Gender,
  type ActivityLevel,
  type GoalType,
} from '@/lib/calc/bmr';
import { formatSupabaseError } from '@/lib/errors';
import { todayISO } from '@/lib/dates';
import { ProfileFormSchema } from '@/lib/validation/schemas';
import { saveOnboardingProfile } from '../services/onboardingService';
import type { OnboardingStep } from '../types';

/**
 * Hook managing multi-step onboarding wizard state, calculations, and profile creation.
 */
export function useOnboarding() {
  const router = useRouter();

  const [step, setStep] = useState<OnboardingStep>(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [fullName, setFullName] = useState('');
  const [dob, setDob] = useState('2000-01-01');
  const [gender, setGender] = useState<Gender>('male');
  const [heightCm, setHeightCm] = useState<number>(170);
  const [weightKg, setWeightKg] = useState<number>(70);
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>('moderate');
  const [goalType, setGoalType] = useState<GoalType>('lose');

  // Calculations
  const age = ageFromDOB(new Date(dob));
  const isMinor = age < 18;
  const bmr = isMinor ? 0 : Math.round(calculateBMR(weightKg, heightCm, Math.max(10, age || 25), gender));
  const tdee = isMinor ? 0 : Math.round(calculateTDEE(bmr, activityLevel));
  const recommendedGoal = isMinor ? 0 : calculateCalorieGoal(tdee, goalType, gender);
  const floor = getCalorieGoalFloor(gender);

  const [calorieGoal, setCalorieGoal] = useState<number>(recommendedGoal || 2000);
  const isBelowFloor = !isMinor && calorieGoal < floor;

  function handleGoalTypeChange(newGoal: GoalType) {
    setGoalType(newGoal);
    if (!isMinor) {
      const updated = calculateCalorieGoal(tdee, newGoal, gender);
      setCalorieGoal(updated);
    }
  }

  async function handleFinish() {
    if (isMinor) {
      setError(
        'FitCalc is designed for adults (18+). Calorie deficits and restriction are not recommended for minors without parental and medical supervision.'
      );
      return;
    }

    if (isBelowFloor) {
      setError(
        `Daily calorie goal cannot be below the safety floor of ${floor} kcal for ${
          gender === 'female' ? 'women' : 'men'
        }.`
      );
      return;
    }

    setSaving(true);
    setError(null);

    const validation = ProfileFormSchema.safeParse({
      full_name: fullName.trim() || null,
      date_of_birth: dob,
      gender,
      height_cm: heightCm,
      weight_kg: weightKg,
      activity_level: activityLevel,
      goal_type: goalType,
      daily_calorie_goal: calorieGoal,
    });

    if (!validation.success) {
      setError(validation.error.issues[0]?.message || 'Please check your inputs.');
      setSaving(false);
      return;
    }

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError('Please sign in to save your profile.');
      setSaving(false);
      return;
    }

    const { error: saveError } = await saveOnboardingProfile({
      userId: user.id,
      profileData: validation.data,
      weightKg,
      loggedOn: todayISO(),
    });

    if (saveError) {
      setError(formatSupabaseError(saveError));
      setSaving(false);
      return;
    }

    setSaving(false);
    router.push('/dashboard');
    router.refresh();
  }

  return {
    step,
    setStep,
    saving,
    error,
    setError,
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
  };
}
