/**
 * WeighInCard: Daily weight logger and metabolic metrics (BMR/TDEE) summary card.
 * Rendered inside ProfileScreen.
 */

'use client';

import { Scale, Target, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import type { GoalType } from '../types';

interface WeighInCardProps {
  weightKg: number;
  newWeight: string;
  setNewWeight: (v: string) => void;
  savingWeight: boolean;
  bmr: number;
  tdee: number;
  goalType: GoalType;
  onQuickWeightLog: (e: React.FormEvent) => void;
}

export function WeighInCard({
  weightKg,
  newWeight,
  setNewWeight,
  savingWeight,
  bmr,
  tdee,
  goalType,
  onQuickWeightLog,
}: WeighInCardProps) {
  return (
    <div className="space-y-6">
      {/* Quick Weight Log */}
      <div className="bg-plate rounded-2xl border border-steel-200/80 p-5 shadow-xs space-y-3">
        <div className="flex items-center gap-2 pb-2 border-b border-steel-200">
          <Scale className="h-5 w-5 text-haldi-600" />
          <h3 className="font-heading font-semibold text-ink text-sm">Log Today&apos;s Weight</h3>
        </div>
        <p className="text-xs text-ink/60">Current recorded weight: <strong className="text-ink">{weightKg} kg</strong></p>

        <form onSubmit={onQuickWeightLog} className="space-y-3">
          <div>
            <input
              type="number"
              step="0.1"
              min="20"
              max="500"
              placeholder="e.g. 69.5 kg"
              value={newWeight}
              onChange={(e) => setNewWeight(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-steel-300 bg-plate text-ink text-sm tabular-nums focus:ring-2 focus:ring-haldi-500 focus:outline-none"
            />
          </div>
          <Button type="submit" size="sm" variant="secondary" disabled={savingWeight || !newWeight} className="w-full">
            {savingWeight ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Scale className="h-4 w-4 mr-1" />}
            Record Weight
          </Button>
        </form>
      </div>

      {/* Metabolic Stats Preview */}
      <div className="bg-plate rounded-2xl border border-steel-200/80 p-5 shadow-xs space-y-3 text-xs">
        <div className="flex items-center gap-2 pb-2 border-b border-steel-200">
          <Target className="h-5 w-5 text-haldi-600" />
          <h3 className="font-heading font-semibold text-ink text-sm">Metabolic Rates</h3>
        </div>
        <div className="space-y-2 text-ink/70">
          <div className="flex justify-between py-1 border-b border-steel-100">
            <span>BMR (Basal Metabolic Rate):</span>
            <span className="font-semibold text-ink tabular-nums">{bmr} kcal</span>
          </div>
          <div className="flex justify-between py-1 border-b border-steel-100">
            <span>TDEE (Maintenance):</span>
            <span className="font-semibold text-ink tabular-nums">{tdee} kcal</span>
          </div>
          <div className="flex justify-between py-1">
            <span>Goal Adjustment:</span>
            <span className="font-semibold text-patta-700 tabular-nums">
              {goalType === 'lose' ? '-400 kcal' : goalType === 'gain' ? '+300 kcal' : '0 kcal'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
