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
    <div className="md:col-span-1 bg-plate p-5 rounded-2xl border border-steel-200/80 shadow-xs space-y-4">
      <div className="flex items-center gap-2.5 pb-3 border-b border-steel-200">
        <Activity className="h-5 w-5 text-haldi-600" />
        <h2 className="font-heading font-semibold text-ink text-base">Record Workout</h2>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-ink/70 mb-1.5">
            Exercise Activity
          </label>
          <select
            value={selectedExerciseId}
            onChange={(e) => setSelectedExerciseId(Number(e.target.value))}
            className="w-full px-3 py-2.5 rounded-xl border border-steel-300 text-sm focus:ring-2 focus:ring-haldi-500 focus:outline-none bg-plate text-ink"
          >
            {exercises.map((ex) => (
              <option key={ex.id} value={ex.id}>
                {ex.name} ({ex.met} MET)
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-ink/70 mb-1.5">
            Duration (minutes)
          </label>
          <div className="relative">
            <Clock className="absolute left-3 top-3 h-4 w-4 text-ink/40" />
            <input
              type="number"
              min="1"
              max="480"
              value={durationMin}
              onChange={(e) => setDurationMin(Math.max(1, Number(e.target.value) || 0))}
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-steel-300 bg-plate text-ink text-sm tabular-nums focus:ring-2 focus:ring-haldi-500 focus:outline-none"
            />
          </div>
        </div>

        {/* 120-Minute Safety Flag */}
        {durationMin > 120 && (
          <div className="p-3 bg-haldi-50 border border-haldi-200 rounded-xl text-xs text-haldi-900 flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0 text-haldi-700 mt-0.5" />
            <span>
              <strong>Over 120 minutes!</strong> Sessions over 2 hours carry higher risks of fatigue or overuse injury. Ensure adequate hydration and rest.
            </span>
          </div>
        )}

        {/* Live Calculation Preview */}
        <div className="p-3.5 rounded-xl bg-steel-100/60 border border-steel-200 space-y-1">
          <span className="text-xs text-ink/60">Estimated Burn ({userWeight} kg body weight)</span>
          <p className="text-xl font-heading font-bold text-ink flex items-center gap-1.5 tabular-nums">
            <Flame className="h-5 w-5 text-haldi-600" /> {estimatedCalories} <span className="text-xs font-normal text-ink/60">kcal</span>
          </p>
        </div>

        {error && <p className="text-xs text-chukandar-600">{error}</p>}

        <Button type="submit" disabled={submitting} className="w-full">
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> Saving...
            </>
          ) : (
            <>
              <Plus className="h-4 w-4 mr-1.5" /> Log Workout
            </>
          )}
        </Button>
      </form>
    </div>
  );
}
