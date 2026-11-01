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

  // Sort: realistic first (green), then unrealistic (amber/red)
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
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              activeCategory === cat
                ? 'bg-emerald-600 text-white'
                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {sorted.length === 0 ? (
        <p className="py-8 text-center text-sm text-gray-500">No exercises found for this category.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Exercise</th>
                <th className="hidden px-4 py-3 text-left font-semibold text-gray-700 sm:table-cell">Category</th>
                <th className="hidden px-4 py-3 text-left font-semibold text-gray-700 sm:table-cell">Intensity</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-700">Total Time</th>
                {days > 1 && (
                  <th className="px-4 py-3 text-right font-semibold text-gray-700">Per Day</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sorted.map((r) => {
                const rowClass = r.isUnrealistic
                  ? 'bg-amber-50 hover:bg-amber-100'
                  : 'bg-white hover:bg-emerald-50';
                return (
                  <tr key={r.exercise.id} className={rowClass}>
                    <td className="px-4 py-3 font-medium text-gray-900">{r.exercise.name}</td>
                    <td className="hidden px-4 py-3 text-gray-600 sm:table-cell">
                      {r.exercise.category ?? '—'}
                    </td>
                    <td className="hidden px-4 py-3 text-gray-600 sm:table-cell">
                      {intensityLabel(r.exercise.intensity)}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-700">
                      {formatDuration(r.minutes)}
                    </td>
                    {days > 1 && (
                      <td className="px-4 py-3 text-right">
                        {r.isUnrealistic ? (
                          <span className="inline-flex items-center gap-1 font-medium text-amber-700">
                            <AlertTriangle className="h-3.5 w-3.5" />
                            {r.minutesPerDay}min/day
                          </span>
                        ) : (
                          <span className="font-medium text-emerald-700">
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
            className="rounded-lg bg-emerald-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700 active:bg-emerald-800"
          >
            Save Plan
          </button>
        </div>
      )}
    </div>
  );
}
