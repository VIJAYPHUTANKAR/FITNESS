'use client';

import { formatLocalDate } from '@/lib/dates';

interface WeeklyStreakProps {
  /** ISO date strings (YYYY-MM-DD) on which food was logged */
  loggedDates: string[];
}

export default function WeeklyStreak({ loggedDates }: WeeklyStreakProps) {
  const loggedSet = new Set(loggedDates);

  // Build last-7-days array (oldest → newest) using browser local date
  const today = new Date();
  const days: { iso: string; label: string; logged: boolean }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const iso = formatLocalDate(d);
    days.push({
      iso,
      label: d.toLocaleDateString('en-US', { weekday: 'narrow' }),
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
    <div className="flex flex-col items-start gap-2">
      {/* Day circles */}
      <div className="flex gap-1.5 flex-wrap">
        {days.map((day) => (
          <div key={day.iso} className="flex flex-col items-center gap-1">
            <div
              title={day.iso}
              className={`h-7 w-7 rounded-full flex items-center justify-center text-[10px] font-semibold transition-colors ${
                day.logged
                  ? 'bg-patta-600 text-white shadow-xs'
                  : 'bg-steel-100 text-ink/40'
              }`}
            >
              {day.logged ? '✓' : ''}
            </div>
            <span className="text-[10px] text-ink/50">{day.label}</span>
          </div>
        ))}
      </div>

      {/* Streak label */}
      <div className="flex items-center gap-1.5 pt-0.5">
        {streak > 0 ? (
          <p className="text-xs font-semibold text-ink tabular-nums">
            {streak}-day streak!
          </p>
        ) : (
          <p className="text-[11px] text-ink/40">Log today to start streak</p>
        )}
      </div>
    </div>
  );
}
