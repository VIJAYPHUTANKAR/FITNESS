/**
 * ActivityEquivalentsForm: Calorie target and multi-day pacing inputs for activity equivalents.
 * Rendered inside BurnCalculatorScreen.
 */

'use client';

interface ActivityEquivalentsFormProps {
  calories: number;
  setCalories: (val: number) => void;
  days: number;
  setDays: (val: number) => void;
  onAutoSuggest: () => void;
  canAutoSuggest: boolean;
}

export function ActivityEquivalentsForm({
  calories,
  setCalories,
  days,
  setDays,
  onAutoSuggest,
  canAutoSuggest,
}: ActivityEquivalentsFormProps) {
  return (
    <div className="rounded-2xl border border-steel-200/80 bg-plate p-6 shadow-xs space-y-4">
      <div className="grid gap-5 sm:grid-cols-2">
        {/* Calories input */}
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-ink/70" htmlFor="calories">
            Calories (kcal, max 2,000)
          </label>
          <input
            id="calories"
            type="number"
            min={1}
            max={2000}
            step={50}
            value={calories || ''}
            onChange={(e) => setCalories(Math.max(0, Math.min(2000, Number(e.target.value))))}
            placeholder="e.g. 500"
            className="w-full rounded-xl border border-steel-300 bg-plate px-3.5 py-2.5 text-sm text-ink tabular-nums placeholder:text-ink/40 focus:border-haldi-500 focus:outline-none focus:ring-1 focus:ring-haldi-500"
          />
        </div>

        {/* Days spinner */}
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-ink/70" htmlFor="days">
            Spread across N days (1 - 30)
          </label>
          <div className="flex items-center gap-2">
            <input
              id="days"
              type="number"
              min={1}
              max={30}
              value={days}
              onChange={(e) =>
                setDays(Math.min(30, Math.max(1, Number(e.target.value))))
              }
              className="w-24 rounded-xl border border-steel-300 bg-plate px-3.5 py-2.5 text-sm text-ink tabular-nums focus:border-haldi-500 focus:outline-none focus:ring-1 focus:ring-haldi-500"
            />
            <button
              type="button"
              onClick={onAutoSuggest}
              disabled={!canAutoSuggest}
              className="rounded-xl border border-haldi-600 bg-haldi-50/50 px-3.5 py-2.5 text-xs font-semibold text-haldi-800 transition-colors hover:bg-haldi-100 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Auto-suggest Safe Pace
            </button>
          </div>
        </div>
      </div>

      {days > 1 && calories > 0 && (
        <div className="pt-2 border-t border-steel-100 flex items-center justify-between text-xs text-ink/60 flex-wrap gap-2 tabular-nums">
          <p>
            Paced at <strong className="text-ink">{Math.round(calories / days)} kcal/day</strong> across {days} days
          </p>
        </div>
      )}
    </div>
  );
}
