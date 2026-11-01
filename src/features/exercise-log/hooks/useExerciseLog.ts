'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { todayISO, addDays } from '@/lib/dates';
import { formatSupabaseError } from '@/lib/errors';
import { ExerciseLogFormSchema } from '@/lib/validation/schemas';
import {
  getExercisesCatalog,
  getUserWeight,
  fetchExerciseLogs,
  insertExerciseLog,
  updateExerciseLog,
  deleteExerciseLog,
} from '../services/exerciseLogService';
import type { Exercise, ExerciseLog } from '../types';

/**
 * Hook managing exercise logging screen state, catalog, calculations, and mutations.
 */
export function useExerciseLog() {
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

  useEffect(() => {
    async function loadInitial() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const weight = await getUserWeight(user.id);
      setUserWeight(weight);

      const catalog = await getExercisesCatalog();
      setExercises(catalog);
      if (catalog.length > 0) {
        setSelectedExerciseId(catalog[0].id);
      }
    }

    loadInitial();
  }, [supabase]);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    const data = await fetchExerciseLogs(user.id, loggedOn);
    setLogs(data);
    setLoading(false);
  }, [supabase, loggedOn]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  function changeDate(days: number) {
    setLoggedOn(addDays(loggedOn, days));
  }

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

    const { error: insertErr } = await insertExerciseLog(user.id, validation.data);
    setSubmitting(false);

    if (insertErr) {
      setError(formatSupabaseError(insertErr));
      return;
    }

    fetchLogs();
  }

  async function handleUpdateLog(log: ExerciseLog) {
    setUpdating(true);

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

    const { error: updateErr } = await updateExerciseLog(log.id, validation.data.duration_min, validation.data.calories_burned);
    setUpdating(false);

    if (updateErr) {
      setError(formatSupabaseError(updateErr));
      return;
    }

    setEditingId(null);
    fetchLogs();
  }

  async function handleDeleteLog(id: number) {
    await deleteExerciseLog(id);
    fetchLogs();
  }

  const totalBurned = Math.round(logs.reduce((acc, curr) => acc + Number(curr.calories_burned), 0));
  const totalMinutes = Math.round(logs.reduce((acc, curr) => acc + Number(curr.duration_min), 0));

  return {
    loggedOn,
    setLoggedOn,
    exercises,
    logs,
    userWeight,
    loading,
    selectedExerciseId,
    setSelectedExerciseId,
    durationMin,
    setDurationMin,
    submitting,
    error,
    editingId,
    setEditingId,
    editDuration,
    setEditDuration,
    updating,
    changeDate,
    estimatedCalories,
    handleAddExercise,
    handleUpdateLog,
    handleDeleteLog,
    totalBurned,
    totalMinutes,
  };
}
