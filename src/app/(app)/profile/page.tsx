'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import {
  calculateBMR,
  calculateTDEE,
  calculateCalorieGoal,
  ageFromDOB,
  type Gender,
  type ActivityLevel,
  type GoalType,
} from '@/lib/calc/bmr';
import { todayISO } from '@/lib/utils';
import type { Profile } from '@/types/database';
import { Button } from '@/components/ui/Button';
import {
  User,
  Scale,
  Target,
  LogOut,
  AlertTriangle,
  Loader2,
  Check,
  RefreshCw
} from 'lucide-react';

export default function ProfilePage() {
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

  useEffect(() => {
    async function fetchProfile() {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

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

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from('profiles').upsert({
      id: user.id,
      full_name: fullName.trim() || null,
      date_of_birth: dob,
      gender,
      height_cm: heightCm,
      weight_kg: weightKg,
      activity_level: activityLevel,
      goal_type: goalType,
      daily_calorie_goal: calorieGoal,
    });

    setSaving(false);
    if (error) {
      setErrorMsg(error.message);
    } else {
      setSuccessMsg('Profile updated successfully!');
      setTimeout(() => setSuccessMsg(null), 3000);
    }
  }

  async function handleQuickWeightLog(e: React.FormEvent) {
    e.preventDefault();
    const w = parseFloat(newWeight);
    if (isNaN(w) || w <= 20 || w >= 350) return;

    setSavingWeight(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // 1. Insert into weight_logs
    await supabase.from('weight_logs').upsert(
      {
        user_id: user.id,
        logged_on: todayISO(),
        weight_kg: w,
      },
      { onConflict: 'user_id,logged_on' }
    );

    // 2. Update profiles table
    await supabase.from('profiles').update({ weight_kg: w }).eq('id', user.id);

    setWeightKg(w);
    setNewWeight('');
    setSavingWeight(false);
    setSuccessMsg('Weight updated for today!');
    setTimeout(() => setSuccessMsg(null), 3000);
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 text-emerald-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Account & Profile</h1>
          <p className="text-xs text-gray-500 mt-1">Manage physical stats, calorie goals, and account data.</p>
        </div>
        <Button variant="ghost" onClick={handleSignOut} className="text-red-600 hover:bg-red-50">
          <LogOut className="h-4 w-4 mr-1.5" /> Sign Out
        </Button>
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-semibold flex items-center gap-2">
          <Check className="h-4 w-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3 bg-red-50 text-red-600 rounded-xl text-xs font-semibold flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Settings Form */}
        <div className="md:col-span-2 bg-white rounded-3xl border border-gray-100 p-6 shadow-sm space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
            <User className="h-5 w-5 text-emerald-600" />
            <h2 className="font-bold text-gray-900 text-base">Personal Details</h2>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4">
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

            {/* Target Calorie Field with Sync button */}
            <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-emerald-800">Daily Calorie Target</span>
                  <p className="text-xl font-bold text-emerald-900">{calorieGoal} kcal</p>
                </div>
                <button
                  type="button"
                  onClick={() => setCalorieGoal(recommendedGoal)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-white px-2.5 py-1.5 rounded-lg border border-emerald-200 shadow-xs hover:bg-emerald-50"
                  title="Reset to recommended Mifflin-St Jeor formula"
                >
                  <RefreshCw className="h-3.5 w-3.5" /> Use Recommended ({recommendedGoal})
                </button>
              </div>

              <div>
                <label className="block text-[11px] text-gray-500 mb-1">Custom Daily Target</label>
                <input
                  type="number"
                  min="1000"
                  max="6000"
                  value={calorieGoal}
                  onChange={(e) => setCalorieGoal(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                />
              </div>
            </div>

            <Button type="submit" disabled={saving} className="w-full">
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Check className="h-4 w-4 mr-1" />}
              Save Profile Changes
            </Button>
          </form>
        </div>

        {/* Right Column: Quick Weight Log & Met info */}
        <div className="space-y-6">
          {/* Quick Weight Log */}
          <div className="bg-white rounded-3xl border border-gray-100 p-5 shadow-sm space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
              <Scale className="h-5 w-5 text-emerald-600" />
              <h3 className="font-bold text-gray-900 text-sm">Log Today's Weight</h3>
            </div>
            <p className="text-xs text-gray-500">Current recorded weight: <strong>{weightKg} kg</strong></p>

            <form onSubmit={handleQuickWeightLog} className="space-y-3">
              <div>
                <input
                  type="number"
                  step="0.1"
                  placeholder="e.g. 69.5 kg"
                  value={newWeight}
                  onChange={(e) => setNewWeight(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
              <Button type="submit" size="sm" variant="outline" disabled={savingWeight || !newWeight} className="w-full">
                {savingWeight ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Scale className="h-4 w-4 mr-1" />}
                Record Weight
              </Button>
            </form>
          </div>

          {/* Metabolic Stats Preview */}
          <div className="bg-white rounded-3xl border border-gray-100 p-5 shadow-sm space-y-3 text-xs">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
              <Target className="h-5 w-5 text-emerald-600" />
              <h3 className="font-bold text-gray-900 text-sm">Metabolic Rates</h3>
            </div>
            <div className="space-y-2 text-gray-600">
              <div className="flex justify-between py-1 border-b border-gray-50">
                <span>BMR (Base Burn):</span>
                <span className="font-semibold text-gray-900">{bmr} kcal</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-50">
                <span>TDEE (Maintenance):</span>
                <span className="font-semibold text-gray-900">{tdee} kcal</span>
              </div>
              <div className="flex justify-between py-1">
                <span>Calculated Deficit/Surplus:</span>
                <span className="font-semibold text-emerald-700">
                  {goalType === 'lose' ? '-400 kcal' : goalType === 'gain' ? '+300 kcal' : '0 kcal'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
