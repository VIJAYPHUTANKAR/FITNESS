'use client';

interface CalorieRingProps {
  caloriesIn: number;
  goal: number;
  /** Diameter in px. Default 180 */
  size?: number;
}

export function CalorieRing({ caloriesIn, goal, size = 180 }: CalorieRingProps) {
  const strokeWidth = size * 0.08;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = goal > 0 ? Math.min(caloriesIn / goal, 1) : 0;
  const offset = circumference * (1 - pct);

  // Color thresholds
  const color =
    pct >= 1
      ? '#ef4444'   // red – over goal
      : pct >= 0.85
      ? '#f97316'   // orange – near goal
      : '#10b981';  // emerald – healthy

  const remaining = Math.max(goal - caloriesIn, 0);
  const over = caloriesIn - goal;

  return (
    <div className="flex flex-col items-center gap-2">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90"
        aria-label={`Calorie ring: ${caloriesIn} of ${goal} kcal consumed`}
      >
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e2e8f0"
          strokeWidth={strokeWidth}
        />
        {/* Progress */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.6s ease, stroke 0.4s ease' }}
        />
      </svg>

      {/* Center text – absolutely positioned over the ring */}
      <div
        className="pointer-events-none absolute flex flex-col items-center justify-center text-center"
        style={{ width: size, height: size }}
      >
        <span className="text-2xl font-bold tabular-nums text-slate-800">
          {caloriesIn.toLocaleString()}
        </span>
        <span className="text-xs text-slate-500">
          / {goal.toLocaleString()} kcal
        </span>
        {over > 0 ? (
          <span className="mt-1 text-xs font-medium text-red-500">
            +{over.toLocaleString()} over
          </span>
        ) : (
          <span className="mt-1 text-xs font-medium text-emerald-600">
            {remaining.toLocaleString()} left
          </span>
        )}
      </div>
    </div>
  );
}

/** Wrapper that handles the relative positioning needed for the overlay text. */
export function CalorieRingWrapper(props: CalorieRingProps) {
  const { size = 180 } = props;
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <CalorieRing {...props} />
    </div>
  );
}
