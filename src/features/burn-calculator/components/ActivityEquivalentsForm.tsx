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
    <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm space-y-4">
      <div className="grid gap-5 sm:grid-cols-2">
        {/* Calories input */}
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-gray-700" htmlFor="calories">
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
            className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        {/* Days spinner */}
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-gray-700" htmlFor="days">
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
              className="w-24 rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
            <button
              type="button"
              onClick={onAutoSuggest}
              disabled={!canAutoSuggest}
              className="rounded-xl border border-emerald-600 px-3.5 py-2.5 text-xs font-semibold text-emerald-700 transition-colors hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Auto-suggest Safe Pace
            </button>
          </div>
        </div>
      </div>

      {days > 1 && calories > 0 && (
        <div className="pt-2 border-t border-gray-50 flex items-center justify-between text-xs text-gray-600 flex-wrap gap-2">
          <p className="text-gray-500">
            Paced at <strong className="text-gray-800">{Math.round(calories / days)} kcal/day</strong> across {days} days
          </p>
        </div>
      )}
    </div>
  );
}
