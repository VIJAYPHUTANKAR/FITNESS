'use client';

interface WeeklyStreakProps {
  /** ISO date strings (YYYY-MM-DD) on which food was logged */
  loggedDates: string[];
}

function toISODate(d: Date): string {
  return d.toISOString().split('T')[0];
}

export default function WeeklyStreak({ loggedDates }: WeeklyStreakProps) {
  const loggedSet = new Set(loggedDates);

  // Build last-7-days array (oldest → newest)
  const today = new Date();
  const days: { iso: string; label: string; logged: boolean }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const iso = toISODate(d);
    days.push({
      iso,
      label: d.toLocaleDateString('en-US', { weekday: 'short' }),
      logged: loggedSet.has(iso),
    });
  }

  // Streak = consecutive logged days ending today
  let streak = 0;
  for (let i = days.length - 1; i >= 0; i--) {
    if (days[i].logged) streak++;
    else break;
  }

  return (
    <div className="flex flex-col items-start gap-3">
      {/* Day circles */}
      <div className="flex gap-2 flex-wrap">
        {days.map((day) => (
          <div key={day.iso} className="flex flex-col items-center gap-1">
            <div
              title={day.iso}
              className={`h-9 w-9 rounded-full flex items-center justify-center text-xs font-semibold transition-colors ${
                day.logged
                  ? 'bg-green-500 text-white shadow-sm shadow-green-200'
                  : 'bg-gray-100 text-gray-400'
              }`}
            >
              {day.logged ? '✓' : ''}
            </div>
            <span className="text-[10px] text-gray-400">{day.label}</span>
          </div>
        ))}
      </div>

      {/* Streak label */}
      <div className="flex items-center gap-2">
        <span className="text-lg">🔥</span>
        {streak > 0 ? (
          <p className="text-sm font-semibold text-gray-700">
            {streak}-day streak!
          </p>
        ) : (
          <p className="text-sm text-gray-400">No active streak — log today to start one!</p>
        )}
      </div>
    </div>
  );
}
