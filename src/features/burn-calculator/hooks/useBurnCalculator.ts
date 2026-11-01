'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  calculateBurnPlan,
  suggestDays,
  type BurnResult,
  type Exercise,
} from '@/lib/calc/burn';
import { formatSupabaseError } from '@/lib/errors';
import { BurnPlanFormSchema } from '@/lib/validation/schemas';
import {
  loadUserProfile,
  loadExercisesCatalog,
  loadSavedBurnPlans,
  saveBurnPlan,
  deleteSavedBurnPlan,
} from '../services/burnPlanService';
import type { Profile, BurnPlan } from '../types';

/**
 * Hook managing activity equivalents calculations, auto-suggest pace, and saved plans.
 */
export function useBurnCalculator() {
  const supabase = createClient();

  const [calories, setCalories] = useState<number>(500);
  const [days, setDays] = useState<number>(1);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState('');
  const [savedPlans, setSavedPlans] = useState<BurnPlan[]>([]);

  useEffect(() => {
    async function loadInitial() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const [userProf, exCatalog] = await Promise.all([
        loadUserProfile(user.id),
        loadExercisesCatalog(),
      ]);

      setProfile(userProf);
      setLoadingProfile(false);
      setExercises(exCatalog);
    }
    loadInitial();
  }, [supabase]);

  const refreshSavedPlans = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const plans = await loadSavedBurnPlans(user.id);
    setSavedPlans(plans);
  }, [supabase]);

  useEffect(() => {
    void (async () => {
      await refreshSavedPlans();
    })();
  }, [refreshSavedPlans]);

  const results: BurnResult[] = useMemo(() => {
    return calories > 0 && profile?.weight_kg && exercises.length > 0
      ? calculateBurnPlan(calories, profile.weight_kg, exercises, days)
      : [];
  }, [calories, profile, exercises, days]);

  const handleAutoSuggest = useCallback(() => {
    if (!profile?.weight_kg || exercises.length === 0 || calories <= 0) return;
    const suggested = suggestDays(calories, profile.weight_kg, exercises);
    setDays(suggested);
  }, [calories, profile, exercises]);

  const isExceedingDailyCap = useMemo(() => {
    if (calories <= 0 || days <= 0) return false;
    if (calories / days > 1000) return true;
    return results.some((r) => (r.minutesPerDay ?? r.minutes) > 120);
  }, [calories, days, results]);

  const handleSavePlan = useCallback(async () => {
    if (!profile || results.length === 0) return;

    if (isExceedingDailyCap) {
      setSavedMsg(
        'Cannot save plan: exceeds daily safety cap of 1,000 kcal or 120 minutes per day. Please increase days or reduce calories.'
      );
      return;
    }

    const validation = BurnPlanFormSchema.safeParse({
      calories_to_burn: calories,
      days,
      plan: results,
    });

    if (!validation.success) {
      setSavedMsg(validation.error.issues[0]?.message || 'Invalid plan configuration.');
      return;
    }

    setSaving(true);
    setSavedMsg('');
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setSaving(false);
      return;
    }

    const { error } = await saveBurnPlan(user.id, {
      calories_to_burn: validation.data.calories_to_burn,
      days: validation.data.days,
      plan: results,
    });

    setSaving(false);
    if (!error) {
      setSavedMsg('Plan saved successfully!');
      refreshSavedPlans();
      setTimeout(() => setSavedMsg(''), 4000);
    } else {
      setSavedMsg(formatSupabaseError(error));
    }
  }, [supabase, profile, calories, days, results, isExceedingDailyCap, refreshSavedPlans]);

  async function handleDeleteSavedPlan(planId: number) {
    await deleteSavedBurnPlan(planId);
    refreshSavedPlans();
  }

  return {
    calories,
    setCalories,
    days,
    setDays,
    profile,
    loadingProfile,
    results,
    isExceedingDailyCap,
    handleAutoSuggest,
    handleSavePlan,
    handleDeleteSavedPlan,
    saving,
    savedMsg,
    savedPlans,
  };
}
