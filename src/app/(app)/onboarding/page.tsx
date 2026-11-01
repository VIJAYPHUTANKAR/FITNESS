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
import { todayISO, formatSupabaseError } from '@/lib/utils';
import { ProfileFormSchema } from '@/lib/validation/schemas';
import { Button } from '@/components/ui/Button';
import {
  User,
  Heart,
  Target,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Loader2,
  Sparkles,
  Info,
  AlertTriangle
} from 'lucide-react';

export default function OnboardingPage() {
  const router = useRouter();
  const supabase = createClient();

  const [step, setStep] = useState<1 | 2 | 3>(1);
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

  // Math
  const age = ageFromDOB(new Date(dob));
  const bmr = Math.round(calculateBMR(weightKg, heightCm, Math.max(10, age || 25), gender));
  const tdee = Math.round(calculateTDEE(bmr, activityLevel));
  const recommendedGoal = calculateCalorieGoal(tdee, goalType, gender);
  const floor = getCalorieGoalFloor(gender);

  const [calorieGoal, setCalorieGoal] = useState<number>(recommendedGoal);
  const isBelowFloor = calorieGoal < floor;

  function handleGoalTypeChange(newGoal: GoalType) {
    setGoalType(newGoal);
    const updated = calculateCalorieGoal(tdee, newGoal, gender);
    setCalorieGoal(updated);
  }

  async function handleFinish() {
    setSaving(true);
    setError(null);

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
      setError(validation.error.issues[0]?.message || 'Please check your inputs.');
      setSaving(false);
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError('Please sign in to save your profile.');
      setSaving(false);
      return;
    }

    // 1. Update Profile
    const { error: profileErr } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        ...validation.data,
      });

    if (profileErr) {
      setError(formatSupabaseError(profileErr));
      setSaving(false);
      return;
    }

    // 2. Log initial weight in weight_logs
    await supabase.from('weight_logs').upsert(
      {
        user_id: user.id,
        logged_on: todayISO(),
        weight_kg: weightKg,
      },
      { onConflict: 'user_id,logged_on' }
    );

    setSaving(false);
    router.push('/dashboard');
    router.refresh();
  }

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

        {/* STEP 1: Basic Information */}
        {step === 1 && (
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
              <Button onClick={() => setStep(2)}>
                Next: Body Stats <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}

        {/* STEP 2: Body Stats & Activity */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
              <Heart className="h-5 w-5 text-emerald-600" />
              <h2 className="font-bold text-gray-900">Body Stats & Activity</h2>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Height (cm)
                </label>
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
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Weight (kg)
                </label>
                <input
                  type="number"
                  min="20"
                  max="500"
                  step="0.1"
                  value={weightKg}
                  onChange={(e) => setWeightKg(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Typical Daily Activity Level
              </label>
              <select
                value={activityLevel}
                onChange={(e) => setActivityLevel(e.target.value as ActivityLevel)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
              >
                <option value="sedentary">Sedentary (desk job, minimal exercise)</option>
                <option value="light">Lightly Active (light exercise 1-3 days/wk)</option>
                <option value="moderate">Moderately Active (moderate workout 3-5 days/wk)</option>
                <option value="active">Active (hard exercise 6-7 days/wk)</option>
                <option value="very_active">Very Active (physical labor or intensive training)</option>
              </select>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1 text-xs text-gray-600">
              <p className="flex justify-between">
                <span>Calculated BMR (Basal Metabolic Rate):</span>
                <strong className="text-gray-900">{bmr} kcal/day</strong>
              </p>
              <p className="flex justify-between">
                <span>Calculated TDEE (Maintenance):</span>
                <strong className="text-gray-900">{tdee} kcal/day</strong>
              </p>
            </div>

            <div className="pt-4 flex justify-between">
              <Button variant="ghost" onClick={() => setStep(1)}>
                <ChevronLeft className="h-4 w-4 mr-1" /> Back
              </Button>
              <Button onClick={() => setStep(3)}>
                Next: Goals <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}

        {/* STEP 3: Goals & Recommendation */}
        {step === 3 && (
          <div className="space-y-5">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
              <Target className="h-5 w-5 text-emerald-600" />
              <h2 className="font-bold text-gray-900">Your Calorie Goal</h2>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2">
                What is your primary goal?
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'lose', label: 'Lose Fat', desc: '-400 kcal deficit' },
                  { id: 'maintain', label: 'Maintain', desc: 'At maintenance' },
                  { id: 'gain', label: 'Gain Muscle', desc: '+300 kcal surplus' },
                ].map(({ id, label, desc }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => handleGoalTypeChange(id as GoalType)}
                    className={`p-3 text-left rounded-2xl border transition-all ${
                      goalType === id
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-900'
                        : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <p className="font-bold text-xs">{label}</p>
                    <p className="text-[10px] text-gray-500 mt-0.5">{desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Target Card */}
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs text-emerald-700 font-semibold uppercase tracking-wider">
                    Recommended Daily Target
                  </span>
                  <p className="text-3xl font-extrabold text-emerald-900 mt-1">
                    {calorieGoal} <span className="text-sm font-normal text-emerald-700">kcal / day</span>
                  </p>
                </div>
                <Sparkles className="h-8 w-8 text-emerald-500 shrink-0" />
              </div>
              <p className="text-xs text-emerald-800">
                Formula recommendation: BMR {bmr} &times; Activity multiplier = TDEE {tdee} kcal.
              </p>
            </div>

            {/* Manual Override option */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Customize Calorie Target (Optional)
              </label>
              <input
                type="number"
                min="500"
                max="10000"
                value={calorieGoal}
                onChange={(e) => setCalorieGoal(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />

              {/* Safety Floor Warning */}
              {isBelowFloor && (
                <div className="mt-2 p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
                  <span>
                    <strong>Below safety floor ({floor} kcal)!</strong> Guidelines recommend a minimum intake of {floor} kcal for {gender === 'female' ? 'women' : 'men'} to avoid nutrient deficiencies and metabolic slow-down.
                  </span>
                </div>
              )}
            </div>

            <div className="p-3 bg-gray-50 rounded-xl flex items-start gap-2 text-xs text-gray-500">
              <Info className="h-4 w-4 shrink-0 text-gray-400 mt-0.5" />
              <span>
                Disclaimer: All calorie guidelines are estimates and for informational purposes only. Consult a physician or registered dietitian before starting any aggressive regimen.
              </span>
            </div>

            <div className="pt-4 flex justify-between">
              <Button variant="ghost" onClick={() => setStep(2)} disabled={saving}>
                <ChevronLeft className="h-4 w-4 mr-1" /> Back
              </Button>
              <Button onClick={handleFinish} disabled={saving} className="px-6">
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> Saving...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-1.5" /> Complete Setup
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
