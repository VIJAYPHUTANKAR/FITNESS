/**
 * ExerciseLogList: Displays the list of workouts recorded on a date.
 * Rendered inside ExerciseLogScreen.
 */

'use client';

import { Dumbbell, Activity, Loader2 } from 'lucide-react';
import { formatDate } from '@/lib/dates';
import { ExerciseLogItem } from './ExerciseLogItem';
import type { ExerciseLog } from '../types';

interface ExerciseLogListProps {
  logs: ExerciseLog[];
  loading: boolean;
  loggedOn: string;
  editingId: number | null;
  editDuration: number;
  setEditDuration: (val: number) => void;
  updating: boolean;
  onStartEdit: (id: number, currentDuration: number) => void;
  onCancelEdit: () => void;
  onSaveEdit: (log: ExerciseLog) => void;
  onDelete: (id: number) => void;
}

export function ExerciseLogList({
  logs,
  loading,
  loggedOn,
  editingId,
  editDuration,
  setEditDuration,
  updating,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onDelete,
}: ExerciseLogListProps) {
  return (
    <div className="md:col-span-2 bg-plate p-5 rounded-2xl border border-steel-200/80 shadow-xs space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-steel-200">
        <div className="flex items-center gap-2.5">
          <Dumbbell className="h-5 w-5 text-haldi-600" />
          <h2 className="font-heading font-semibold text-ink text-base">Completed Workouts</h2>
        </div>
        <span className="text-xs text-ink/60 font-medium">{formatDate(loggedOn)}</span>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-7 w-7 text-haldi-600 animate-spin" />
        </div>
      ) : logs.length === 0 ? (
        <div className="text-center py-12 text-ink/50 space-y-2">
          <Activity className="h-10 w-10 mx-auto text-steel-300" />
          <p className="text-sm">No exercises logged for this date.</p>
          <p className="text-xs text-ink/40">Log your workout using the form on the left.</p>
        </div>
      ) : (
        <div className="divide-y divide-steel-100">
          {logs.map((log) => (
            <ExerciseLogItem
              key={log.id}
              log={log}
              isEditing={editingId === log.id}
              editDuration={editDuration}
              setEditDuration={setEditDuration}
              updating={updating}
              onStartEdit={() => onStartEdit(log.id, Number(log.duration_min))}
              onCancelEdit={onCancelEdit}
              onSaveEdit={onSaveEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
