'use client';

import { useState, useEffect } from 'react';
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
import { todayISO } from '@/lib/dates';
import { formatSupabaseError } from '@/lib/errors';
import { ProfileFormSchema, WeightLogFormSchema } from '@/lib/validation/schemas';
import {
  loadUserProfile,
  updateUserProfile,
  logQuickWeight,
  exportUserDataCsv,
  deleteUserAccount,
  signOutUser,
} from '../services/profileService';

/**
 * Hook managing user profile state, metabolic calculations, weigh-in logging, CSV export, and deletion.
 */
export function useProfile() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Profile data
  const [fullName, setFullName] = useState('');
  const [dob, setDob] = useState('2000-01-01');
  const [gender, setGender] = useState<Gender>('male');
  const [heightCm, setHeightCm] = useState<number>(170);
  const [weightKg, setWeightKg] = useState<number>(70);
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>('moderate');
  const [goalType, setGoalType] = useState<GoalType>('lose');
  const [calorieGoal, setCalorieGoal] = useState<number>(2000);

  // New weight quick log
  const [newWeight, setNewWeight] = useState<string>('');
  const [savingWeight, setSavingWeight] = useState(false);

  // Export & Delete state
  const [userEmail, setUserEmail] = useState('');
  const [exporting, setExporting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');
  const [deletingAccount, setDeletingAccount] = useState(false);

  useEffect(() => {
    async function fetchProfile() {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      if (user.email) setUserEmail(user.email);

      const data = await loadUserProfile(user.id);
      if (data) {
        setFullName(data.full_name || '');
        if (data.date_of_birth) setDob(data.date_of_birth);
        if (data.gender) setGender(data.gender);
        if (data.height_cm) setHeightCm(Number(data.height_cm));
        if (data.weight_kg) setWeightKg(Number(data.weight_kg));
        if (data.activity_level) setActivityLevel(data.activity_level);
        if (data.goal_type) setGoalType(data.goal_type);
        if (data.daily_calorie_goal) setCalorieGoal(Number(data.daily_calorie_goal));
      }
      setLoading(false);
    }

    fetchProfile();
  }, [supabase]);

  // Derived calculations
  const age = ageFromDOB(new Date(dob));
  const bmr = Math.round(calculateBMR(weightKg, heightCm, Math.max(10, age || 25), gender));
  const tdee = Math.round(calculateTDEE(bmr, activityLevel));
  const recommendedGoal = calculateCalorieGoal(tdee, goalType, gender);
  const floor = getCalorieGoalFloor(gender);
  const isBelowFloor = calorieGoal < floor;

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    if (isBelowFloor) {
      setErrorMsg(
        `Daily calorie goal cannot be below the safety floor of ${floor} kcal for ${
          gender === 'female' ? 'women' : 'men'
        }.`
      );
      setSaving(false);
      return;
    }

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
      setErrorMsg(validation.error.issues[0]?.message || 'Please check your inputs.');
      setSaving(false);
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await updateUserProfile(user.id, validation.data);

    setSaving(false);
    if (error) {
      setErrorMsg(formatSupabaseError(error));
    } else {
      setSuccessMsg('Profile updated successfully!');
      setTimeout(() => setSuccessMsg(null), 3000);
    }
  }

  async function handleQuickWeightLog(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);

    const w = parseFloat(newWeight);
    const validation = WeightLogFormSchema.safeParse({
      logged_on: todayISO(),
      weight_kg: w,
    });

    if (!validation.success) {
      setErrorMsg(validation.error.issues[0]?.message || 'Invalid weight value.');
      return;
    }

    setSavingWeight(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { error: weightErr } = await logQuickWeight(user.id, w);

    if (weightErr) {
      setErrorMsg(formatSupabaseError(weightErr));
      setSavingWeight(false);
      return;
    }

    setWeightKg(w);
    setNewWeight('');
    setSavingWeight(false);
    setSuccessMsg('Weight updated for today!');
    setTimeout(() => setSuccessMsg(null), 3000);
  }

  async function handleExportData() {
    setExporting(true);
    setErrorMsg(null);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setExporting(false);
        return;
      }

      const csvContent = await exportUserDataCsv(user.id);
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `fitcalc_data_export_${todayISO()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Export failed. Please try again.';
      setErrorMsg(msg);
    } finally {
      setExporting(false);
    }
  }

  const isDeleteConfirmed =
    deleteConfirmationText.trim() === 'DELETE' ||
    (Boolean(userEmail) && deleteConfirmationText.trim().toLowerCase() === userEmail.toLowerCase());

  async function handleDeleteAccount() {
    if (!isDeleteConfirmed) return;
    setDeletingAccount(true);
    setErrorMsg(null);

    const { error } = await deleteUserAccount();
    if (error) {
      setErrorMsg(formatSupabaseError(error));
      setDeletingAccount(false);
      setShowDeleteModal(false);
      return;
    }

    await signOutUser();
    router.push('/');
    router.refresh();
  }

  async function handleSignOut() {
    await signOutUser();
    router.push('/login');
    router.refresh();
  }

  return {
    loading,
    saving,
    successMsg,
    errorMsg,
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
    newWeight,
    setNewWeight,
    savingWeight,
    userEmail,
    exporting,
    showDeleteModal,
    setShowDeleteModal,
    deleteConfirmationText,
    setDeleteConfirmationText,
    deletingAccount,
    bmr,
    tdee,
    recommendedGoal,
    floor,
    isBelowFloor,
    isDeleteConfirmed,
    handleSaveProfile,
    handleQuickWeightLog,
    handleExportData,
    handleDeleteAccount,
    handleSignOut,
  };
}
