/**
 * ExerciseForm: Form to select an activity, input duration, view real-time MET calorie burn,
 * and review 120-minute safety notices. Rendered inside ExerciseLogScreen.
 */

'use client';

import { Activity, Clock, Flame, Plus, Loader2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import type { Exercise } from '../types';

interface ExerciseFormProps {
  exercises: Exercise[];
  selectedExerciseId: number | '';
  setSelectedExerciseId: (id: number) => void;
  durationMin: number;
  setDurationMin: (min: number) => void;
  userWeight: number;
  estimatedCalories: number;
  submitting: boolean;
  error: string | null;
  onSubmit: (e: React.FormEvent) => void;
}

export function ExerciseForm({
  exercises,
  selectedExerciseId,
  setSelectedExerciseId,
  durationMin,
  setDurationMin,
  userWeight,
  estimatedCalories,
  submitting,
  error,
  onSubmit,
}: ExerciseFormProps) {
  return (
    <div className="md:col-span-1 bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-4">
      <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
        <Activity className="h-5 w-5 text-emerald-600" />
        <h2 className="font-bold text-gray-900 text-base">Record Workout</h2>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
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
  );
}
