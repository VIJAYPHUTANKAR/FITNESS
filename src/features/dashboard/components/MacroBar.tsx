'use client';

interface MacroBarProps {
  proteinG: number;
  carbsG: number;
  fatG: number;
}

export function MacroBar({ proteinG, carbsG, fatG }: MacroBarProps) {
  const total = proteinG + carbsG + fatG;

  const segments = [
    { label: 'Protein', value: proteinG, color: 'bg-blue-500',   pct: total > 0 ? (proteinG / total) * 100 : 0 },
    { label: 'Carbs',   value: carbsG,   color: 'bg-yellow-400', pct: total > 0 ? (carbsG   / total) * 100 : 0 },
    { label: 'Fat',     value: fatG,     color: 'bg-orange-400', pct: total > 0 ? (fatG     / total) * 100 : 0 },
  ];

  return (
    <div className="flex flex-col gap-2">
      {/* Stacked bar */}
      <div className="flex h-3 w-full overflow-hidden rounded-full bg-slate-100">
        {segments.map(({ label, color, pct }) => (
          <div
            key={label}
            className={`${color} transition-all duration-500`}
            style={{ width: `${pct}%` }}
            title={`${label}: ${pct.toFixed(0)}%`}
          />
        ))}
      </div>

      {/* Legend */}
      <div className="flex justify-between text-xs text-slate-600">
        {segments.map(({ label, value, color, pct }) => (
          <div key={label} className="flex items-center gap-1">
            <span className={`inline-block h-2 w-2 rounded-full ${color}`} />
            <span className="font-medium">{label}</span>
            <span className="text-slate-400">
              {value.toFixed(0)}g ({pct.toFixed(0)}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
