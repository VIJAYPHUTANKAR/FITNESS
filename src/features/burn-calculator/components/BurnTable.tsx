'use client';

import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import type { BurnResult } from '@/lib/calc/burn';
import { formatDuration } from '@/lib/calc/burn';

type Category = 'All' | 'Cardio' | 'Strength' | 'Sports' | 'Flexibility';

const CATEGORIES: Category[] = ['All', 'Cardio', 'Strength', 'Sports', 'Flexibility'];

interface BurnTableProps {
  results: BurnResult[];
  days: number;
  onSavePlan?: () => void;
}

export default function BurnTable({ results, days, onSavePlan }: BurnTableProps) {
  const [activeCategory, setActiveCategory] = useState<Category>('All');

  const filtered = results.filter((r) => {
    if (activeCategory === 'All') return true;
    return r.exercise.category?.toLowerCase() === activeCategory.toLowerCase();
  });

  // Sort: realistic first, then unrealistic (amber)
  const sorted = [...filtered].sort((a, b) => {
    if (a.isUnrealistic === b.isUnrealistic) return 0;
    return a.isUnrealistic ? 1 : -1;
  });

  const intensityLabel = (intensity: string | null) => {
    if (!intensity) return '—';
    return intensity.charAt(0).toUpperCase() + intensity.slice(1);
  };

  return (
    <div className="space-y-3">
      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
              activeCategory === cat
                ? 'bg-neel-700 text-white'
                : 'bg-steel-100 text-ink/70 hover:bg-steel-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {sorted.length === 0 ? (
        <p className="py-8 text-center text-sm text-ink/50">No exercises found for this category.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-steel-200">
          <table className="w-full text-sm">
            <thead className="bg-steel-100/60 text-ink/70">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-xs">Exercise</th>
                <th className="hidden px-4 py-3 text-left font-semibold text-xs sm:table-cell">Category</th>
                <th className="hidden px-4 py-3 text-left font-semibold text-xs sm:table-cell">Intensity</th>
                <th className="px-4 py-3 text-right font-semibold text-xs">Total Time</th>
                {days > 1 && (
                  <th className="px-4 py-3 text-right font-semibold text-xs">Per Day</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-steel-100">
              {sorted.map((r) => {
                const rowClass = r.isUnrealistic
                  ? 'bg-haldi-50/50 hover:bg-haldi-100/60'
                  : 'bg-plate hover:bg-steel-50';
                return (
                  <tr key={r.exercise.id} className={rowClass}>
                    <td className="px-4 py-3 font-medium text-ink">{r.exercise.name}</td>
                    <td className="hidden px-4 py-3 text-ink/60 sm:table-cell">
                      {r.exercise.category ?? '—'}
                    </td>
                    <td className="hidden px-4 py-3 text-ink/60 sm:table-cell">
                      {intensityLabel(r.exercise.intensity)}
                    </td>
                    <td className="px-4 py-3 text-right text-ink/70 tabular-nums">
                      {formatDuration(r.minutes)}
                    </td>
                    {days > 1 && (
                      <td className="px-4 py-3 text-right tabular-nums">
                        {r.isUnrealistic ? (
                          <span className="inline-flex items-center gap-1 font-medium text-haldi-800">
                            <AlertTriangle className="h-3.5 w-3.5 text-haldi-600" />
                            {r.minutesPerDay}min/day
                          </span>
                        ) : (
                          <span className="font-medium text-patta-700">
                            {formatDuration(r.minutesPerDay ?? 0)}
                          </span>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {onSavePlan && sorted.length > 0 && (
        <div className="flex justify-end pt-2">
          <button
            onClick={onSavePlan}
            className="rounded-xl bg-neel-700 px-5 py-2 text-sm font-semibold text-white shadow-xs transition-colors hover:bg-neel-800"
          >
            Save Plan
          </button>
        </div>
      )}
    </div>
  );
}
