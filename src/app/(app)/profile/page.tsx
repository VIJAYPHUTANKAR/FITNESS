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
import { todayISO, formatSupabaseError } from '@/lib/utils';
import { ProfileFormSchema, WeightLogFormSchema } from '@/lib/validation/schemas';
import { Button } from '@/components/ui/Button';
import {
  User,
  Scale,
  Target,
  LogOut,
  AlertTriangle,
  Loader2,
  Check,
  RefreshCw,
  Download,
  Trash2,
  ShieldAlert
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

  // Export & Delete state
  const [userEmail, setUserEmail] = useState('');
  const [exporting, setExporting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');
  const [deletingAccount, setDeletingAccount] = useState(false);

  useEffect(() => {
    async function fetchProfile() {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      if (user.email) setUserEmail(user.email);

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
  const floor = getCalorieGoalFloor(gender);
  const isBelowFloor = calorieGoal < floor;

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    // Zod validation
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

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from('profiles').upsert({
      id: user.id,
      ...validation.data,
    });

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
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // 1. Insert into weight_logs
    const { error: weightErr } = await supabase.from('weight_logs').upsert(
      {
        user_id: user.id,
        logged_on: todayISO(),
        weight_kg: w,
      },
      { onConflict: 'user_id,logged_on' }
    );

    if (weightErr) {
      setErrorMsg(formatSupabaseError(weightErr));
      setSavingWeight(false);
      return;
    }

    // 2. Update profiles table
    await supabase.from('profiles').update({ weight_kg: w }).eq('id', user.id);

    setWeightKg(w);
    setNewWeight('');
    setSavingWeight(false);
    setSuccessMsg('Weight updated for today!');
    setTimeout(() => setSuccessMsg(null), 3000);
  }

  async function handleExportData() {
    setExporting(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setExporting(false);
      return;
    }

    const [foodsRes, exerciseRes, weightRes] = await Promise.all([
      supabase.from('food_logs').select('*').eq('user_id', user.id).order('logged_on', { ascending: false }),
      supabase.from('exercise_logs').select('*').eq('user_id', user.id).order('logged_on', { ascending: false }),
      supabase.from('weight_logs').select('*').eq('user_id', user.id).order('logged_on', { ascending: false }),
    ]);

    let csvContent = 'DATA TYPE,DATE,NAME,AMOUNT,UNIT,CALORIES,PROTEIN(g),CARBS(g),FAT(g)\n';

    // Foods
    if (foodsRes.data) {
      for (const f of foodsRes.data) {
        csvContent += `"FOOD","${f.logged_on}","${f.food_name.replace(/"/g, '""')}",${f.quantity_grams},"g",${f.calories},${f.protein_g ?? 0},${f.carbs_g ?? 0},${f.fat_g ?? 0}\n`;
      }
    }

    // Exercises
    if (exerciseRes.data) {
      for (const e of exerciseRes.data) {
        csvContent += `"EXERCISE","${e.logged_on}","${e.exercise_name.replace(/"/g, '""')}",${e.duration_min},"min",${e.calories_burned},,,,\n`;
      }
    }

    // Weight
    if (weightRes.data) {
      for (const w of weightRes.data) {
        csvContent += `"WEIGHT","${w.logged_on}","Weight Record",${w.weight_kg},"kg",,,,,\n`;
      }
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `fitcalc_data_export_${todayISO()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setExporting(false);
  }

  const isDeleteConfirmed =
    deleteConfirmationText.trim() === 'DELETE' ||
    (Boolean(userEmail) && deleteConfirmationText.trim().toLowerCase() === userEmail.toLowerCase());

  async function handleDeleteAccount() {
    if (!isDeleteConfirmed) return;
    setDeletingAccount(true);
    setErrorMsg(null);

    const { error } = await supabase.rpc('delete_my_account');
    if (error) {
      setErrorMsg(formatSupabaseError(error));
      setDeletingAccount(false);
      setShowDeleteModal(false);
      return;
    }

    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
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
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Account & Profile</h1>
          <p className="text-xs text-gray-500 mt-1">Manage physical stats, calorie goals, and account privacy.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={handleExportData} disabled={exporting}>
            <Download className="h-4 w-4 mr-1.5" /> {exporting ? 'Exporting...' : 'Export Data (CSV)'}
          </Button>
          <Button variant="ghost" size="sm" onClick={handleSignOut} className="text-red-600 hover:bg-red-50">
            <LogOut className="h-4 w-4 mr-1.5" /> Sign Out
          </Button>
        </div>
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
                <label className="block text-[11px] text-gray-500 mb-1">Custom Daily Target (kcal)</label>
                <input
                  type="number"
                  min="500"
                  max="10000"
                  value={calorieGoal}
                  onChange={(e) => setCalorieGoal(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                />
              </div>

              {/* Safety Floor Warning */}
              {isBelowFloor && (
                <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
                  <span>
                    <strong>Below safety floor ({floor} kcal)!</strong> Nutritional guidelines advise against targets below {floor} kcal for {gender === 'female' ? 'women' : 'men'} without clinical supervision to protect metabolic rate and nutrient adequacy.
                  </span>
                </div>
              )}
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
              <h3 className="font-bold text-gray-900 text-sm">Log Today&apos;s Weight</h3>
            </div>
            <p className="text-xs text-gray-500">Current recorded weight: <strong>{weightKg} kg</strong></p>

            <form onSubmit={handleQuickWeightLog} className="space-y-3">
              <div>
                <input
                  type="number"
                  step="0.1"
                  min="20"
                  max="500"
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
                <span>Goal Deficit/Surplus:</span>
                <span className="font-semibold text-emerald-700">
                  {goalType === 'lose' ? '-400 kcal' : goalType === 'gain' ? '+300 kcal' : '0 kcal'}
                </span>
              </div>
            </div>
          </div>

          {/* Danger Zone: Delete Account */}
          <div className="bg-red-50/50 rounded-3xl border border-red-200 p-5 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-red-700 font-bold text-sm">
              <ShieldAlert className="h-5 w-5 text-red-600" />
              <span>Danger Zone</span>
            </div>
            <p className="text-xs text-red-600 leading-relaxed">
              Permanently delete your profile and all associated food, exercise, weight logs, and burn plans. This action cannot be undone.
            </p>
            <Button
              variant="danger"
              size="sm"
              onClick={() => setShowDeleteModal(true)}
              className="w-full"
            >
              <Trash2 className="h-4 w-4 mr-1.5" /> Delete Account
            </Button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-red-100 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="h-6 w-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="font-bold text-gray-900 text-lg">Confirm Account Deletion</h3>
              <p className="text-xs text-gray-500">
                This will permanently delete your account and all records. Type <strong>DELETE</strong> or your email (<strong>{userEmail}</strong>) below to confirm.
              </p>
            </div>

            <input
              type="text"
              value={deleteConfirmationText}
              onChange={(e) => setDeleteConfirmationText(e.target.value)}
              placeholder={`Type DELETE or ${userEmail || 'your email'}`}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-center font-bold text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
            />

            <div className="flex items-center gap-2 pt-2">
              <Button
                variant="ghost"
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirmationText('');
                }}
                disabled={deletingAccount}
                className="w-1/2"
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleDeleteAccount}
                disabled={!isDeleteConfirmed || deletingAccount}
                className="w-1/2"
              >
                {deletingAccount ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
                Confirm Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
