'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { todayISO, formatDate, formatSupabaseError } from '@/lib/utils';
import { ExerciseLogFormSchema } from '@/lib/validation/schemas';
import type { Exercise, ExerciseLog } from '@/types/database';
import { Button } from '@/components/ui/Button';
import {
  Activity,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Flame,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  Loader2,
  Clock,
  Dumbbell,
  AlertTriangle
} from 'lucide-react';

export default function LogExercisePage() {
  const supabase = createClient();

  const [loggedOn, setLoggedOn] = useState(todayISO());
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [logs, setLogs] = useState<ExerciseLog[]>([]);
  const [userWeight, setUserWeight] = useState<number>(70);
  const [loading, setLoading] = useState(true);

  // Form states
  const [selectedExerciseId, setSelectedExerciseId] = useState<number | ''>('');
  const [durationMin, setDurationMin] = useState<number>(30);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Inline editing state
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editDuration, setEditDuration] = useState<number>(30);
  const [updating, setUpdating] = useState(false);

  // Load exercises catalog & user profile
  useEffect(() => {
    async function loadInitial() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('weight_kg')
        .eq('id', user.id)
        .single();

      if (profile?.weight_kg) {
        setUserWeight(Number(profile.weight_kg));
      }

      const { data: exList } = await supabase
        .from('exercises')
        .select('*')
        .order('name');

      if (exList) {
        setExercises(exList);
        if (exList.length > 0) {
          setSelectedExerciseId(exList[0].id);
        }
      }
    }

    loadInitial();
  }, [supabase]);

  // Load exercise logs for selected date
  const fetchLogs = useCallback(async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    const { data } = await supabase
      .from('exercise_logs')
      .select('*')
      .eq('user_id', user.id)
      .eq('logged_on', loggedOn)
      .order('created_at', { ascending: true });

    if (data) {
      setLogs(data);
    }
    setLoading(false);
  }, [supabase, loggedOn]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // Date controls
  function changeDate(days: number) {
    const current = new Date(loggedOn);
    current.setDate(current.getDate() + days);
    setLoggedOn(current.toISOString().split('T')[0]);
  }

  // Selected exercise calculation: calories = MET * weight_kg * (duration_min / 60)
  const currentExercise = exercises.find((e) => e.id === Number(selectedExerciseId));
  const estimatedCalories = currentExercise
    ? Math.round(Number(currentExercise.met) * userWeight * (durationMin / 60))
    : 0;

  async function handleAddExercise(e: React.FormEvent) {
    e.preventDefault();
    if (!currentExercise) return;

    const validation = ExerciseLogFormSchema.safeParse({
      exercise_id: currentExercise.id,
      exercise_name: currentExercise.name,
      logged_on: loggedOn,
      duration_min: durationMin,
      calories_burned: estimatedCalories,
    });

    if (!validation.success) {
      setError(validation.error.issues[0]?.message || 'Please check your input.');
      return;
    }

    setSubmitting(true);
    setError(null);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError('Please sign in to log exercise.');
      setSubmitting(false);
      return;
    }

    const { error: insertErr } = await supabase.from('exercise_logs').insert({
      user_id: user.id,
      ...validation.data,
    });

    setSubmitting(false);

    if (insertErr) {
      setError(formatSupabaseError(insertErr));
      return;
    }

    fetchLogs();
  }

  async function handleUpdateLog(log: ExerciseLog) {
    setUpdating(true);

    // Calculate recalculated calories using exercise MET
    const matchedEx = exercises.find((e) => e.id === log.exercise_id);
    const met = matchedEx ? Number(matchedEx.met) : (log.calories_burned / (userWeight * (log.duration_min / 60)));
    const newCalories = Math.round(met * userWeight * (editDuration / 60));

    const validation = ExerciseLogFormSchema.safeParse({
      exercise_id: log.exercise_id,
      exercise_name: log.exercise_name,
      logged_on: log.logged_on,
      duration_min: editDuration,
      calories_burned: newCalories,
    });

    if (!validation.success) {
      setError(validation.error.issues[0]?.message || 'Invalid duration.');
      setUpdating(false);
      return;
    }

    const { error: updateErr } = await supabase
      .from('exercise_logs')
      .update({
        duration_min: validation.data.duration_min,
        calories_burned: validation.data.calories_burned,
      })
      .eq('id', log.id);

    setUpdating(false);
    if (updateErr) {
      setError(formatSupabaseError(updateErr));
      return;
    }
    setEditingId(null);
    fetchLogs();
  }

  async function handleDeleteLog(id: number) {
    await supabase.from('exercise_logs').delete().eq('id', id);
    fetchLogs();
  }

  const totalBurned = Math.round(logs.reduce((acc, curr) => acc + Number(curr.calories_burned), 0));
  const totalMinutes = Math.round(logs.reduce((acc, curr) => acc + Number(curr.duration_min), 0));

  return (
    <div className="mx-auto max-w-4xl p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Date Header Controller */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => changeDate(-1)}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gray-50 border border-gray-200">
            <Calendar className="h-4 w-4 text-emerald-600" />
            <input
              type="date"
              value={loggedOn}
              onChange={(e) => setLoggedOn(e.target.value)}
              className="text-sm font-semibold text-gray-800 bg-transparent focus:outline-none"
            />
          </div>
          <Button variant="ghost" size="sm" onClick={() => changeDate(1)}>
            <ChevronRight className="h-5 w-5" />
          </Button>
          {loggedOn !== todayISO() && (
            <button
              onClick={() => setLoggedOn(todayISO())}
              className="text-xs font-semibold text-emerald-600 hover:underline ml-1"
            >
              Today
            </button>
          )}
        </div>

        {/* Totals Banner */}
        <div className="flex items-center gap-3 text-xs font-medium">
          <span className="bg-orange-50 border border-orange-200 text-orange-700 px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5">
            <Flame className="h-4 w-4 text-orange-500" /> {totalBurned} kcal burned
          </span>
          <span className="text-gray-500 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100">
            {totalMinutes} min total
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Form: Add Exercise */}
        <div className="md:col-span-1 bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
            <Activity className="h-5 w-5 text-emerald-600" />
            <h2 className="font-bold text-gray-900 text-base">Record Workout</h2>
          </div>

          <form onSubmit={handleAddExercise} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Exercise Activity
              </label>
              <select
                value={selectedExerciseId}
                onChange={(e) => setSelectedExerciseId(Number(e.target.value))}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
              >
                {exercises.map((ex) => (
                  <option key={ex.id} value={ex.id}>
                    {ex.name} ({ex.met} MET)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Duration (minutes)
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="number"
                  min="1"
                  max="480"
                  value={durationMin}
                  onChange={(e) => setDurationMin(Math.max(1, Number(e.target.value) || 0))}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            {/* 120-Minute Safety Flag */}
            {durationMin > 120 && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
                <span>
                  <strong>Over 120 minutes!</strong> Sessions over 2 hours carry higher risks of fatigue or overuse injury. Ensure adequate hydration and rest.
                </span>
              </div>
            )}

            {/* Live Calculation Preview */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-xs text-gray-500">Estimated Burn ({userWeight} kg body weight)</span>
              <p className="text-xl font-bold text-orange-600 flex items-center gap-1">
                <Flame className="h-5 w-5" /> {estimatedCalories} <span className="text-xs font-normal text-gray-500">kcal</span>
              </p>
            </div>

            {error && <p className="text-xs text-red-600">{error}</p>}

            <Button type="submit" disabled={submitting} className="w-full">
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-1" /> Adding...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-1" /> Log Workout
                </>
              )}
            </Button>
          </form>
        </div>

        {/* List: Logged Workouts */}
        <div className="md:col-span-2 bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Dumbbell className="h-5 w-5 text-emerald-600" />
              <h2 className="font-bold text-gray-900 text-base">Completed Workouts</h2>
            </div>
            <span className="text-xs text-gray-400 font-medium">{formatDate(loggedOn)}</span>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-7 w-7 text-emerald-600 animate-spin" />
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-12 text-gray-400 space-y-2">
              <Activity className="h-10 w-10 mx-auto text-gray-200" />
              <p className="text-sm">No exercises logged for this date.</p>
              <p className="text-xs text-gray-400">Log your workout using the form on the left.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {logs.map((log) => {
                const isEditing = editingId === log.id;
                const isOver120 = Number(log.duration_min) > 120;

                return (
                  <div key={log.id} className="py-3.5 flex items-center justify-between gap-3 flex-wrap">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-gray-900 text-sm truncate">{log.exercise_name}</p>
                        {isOver120 && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                            <AlertTriangle className="h-3 w-3 text-amber-600" /> &gt;120 min
                          </span>
                        )}
                      </div>

                      {isEditing ? (
                        <div className="flex items-center gap-2 mt-2">
                          <input
                            type="number"
                            min="1"
                            max="600"
                            value={editDuration}
                            onChange={(e) => setEditDuration(Math.max(1, Number(e.target.value) || 0))}
                            className="w-24 px-2 py-1 text-xs border rounded-lg"
                          />
                          <span className="text-xs text-gray-500">min</span>
                          <button
                            onClick={() => handleUpdateLog(log)}
                            disabled={updating}
                            className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                            title="Save"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="p-1 text-gray-400 hover:bg-gray-100 rounded"
                            title="Cancel"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <p className="text-xs text-gray-500 flex items-center gap-1.5 mt-0.5">
                          <Clock className="h-3.5 w-3.5 text-gray-400" /> {log.duration_min} minutes
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="font-bold text-orange-600 text-sm flex items-center gap-1">
                        <Flame className="h-4 w-4" /> {Math.round(Number(log.calories_burned))} kcal
                      </span>

                      {!isEditing && (
                        <button
                          onClick={() => {
                            setEditingId(log.id);
                            setEditDuration(Number(log.duration_min));
                          }}
                          className="p-1.5 text-gray-400 hover:text-emerald-600 rounded-lg hover:bg-emerald-50 transition-colors"
                          title="Edit duration"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                      )}

                      <button
                        onClick={() => handleDeleteLog(log.id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                        title="Delete entry"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
