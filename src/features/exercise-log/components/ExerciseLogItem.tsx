/**
 * ExerciseLogItem: Renders a single recorded workout row with inline duration editing and delete actions.
 * Rendered inside ExerciseLogList.
 */

'use client';

import { Clock, Flame, Edit2, Trash2, Check, X, AlertTriangle } from 'lucide-react';
import type { ExerciseLog } from '../types';

interface ExerciseLogItemProps {
  log: ExerciseLog;
  isEditing: boolean;
  editDuration: number;
  setEditDuration: (val: number) => void;
  updating: boolean;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSaveEdit: (log: ExerciseLog) => void;
  onDelete: (id: number) => void;
}

export function ExerciseLogItem({
  log,
  isEditing,
  editDuration,
  setEditDuration,
  updating,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onDelete,
}: ExerciseLogItemProps) {
  const isOver120 = Number(log.duration_min) > 120;

  return (
    <div className="py-3.5 flex items-center justify-between gap-3 flex-wrap">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="font-semibold text-ink text-sm truncate">{log.exercise_name}</p>
          {isOver120 && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-haldi-100 text-haldi-900 border border-haldi-200">
              <AlertTriangle className="h-3 w-3 text-haldi-700" /> &gt;120 min
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
              className="w-20 px-2 py-1 text-xs border border-steel-300 rounded-lg bg-plate text-ink tabular-nums focus:outline-none focus:ring-1 focus:ring-haldi-500"
            />
            <span className="text-xs text-ink/60">min</span>
            <button
              onClick={() => onSaveEdit(log)}
              disabled={updating}
              className="p-1 text-neel-700 hover:bg-steel-100 rounded"
              title="Save"
            >
              <Check className="h-4 w-4" />
            </button>
            <button
              onClick={onCancelEdit}
              className="p-1 text-ink/50 hover:bg-steel-100 rounded"
              title="Cancel"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <p className="text-xs text-ink/60 flex items-center gap-1.5 mt-0.5">
            <Clock className="h-3.5 w-3.5 text-ink/40" /> {log.duration_min} minutes
          </p>
        )}
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <span className="font-heading font-semibold text-ink text-sm flex items-center gap-1 tabular-nums">
          <Flame className="h-4 w-4 text-haldi-600" /> {Math.round(Number(log.calories_burned))} kcal
        </span>

        {!isEditing && (
          <button
            onClick={onStartEdit}
            className="p-1.5 text-ink/50 hover:text-ink rounded-lg hover:bg-steel-100 transition-colors"
            title="Edit duration"
          >
            <Edit2 className="h-4 w-4" />
          </button>
        )}

        <button
          onClick={() => onDelete(log.id)}
          className="p-1.5 text-ink/50 hover:text-chukandar-600 rounded-lg hover:bg-steel-100 transition-colors"
          title="Delete entry"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
