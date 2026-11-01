'use client';

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const MACRO_COLORS = {
  Protein: '#B1275B',   // Chukandar (beetroot)
  Carbs:   '#F2B01E',   // Haldi (turmeric)
  Fat:     '#327349',   // Patta (curry leaf)
} as const;

type MacroKey = keyof typeof MACRO_COLORS;

interface MacroEntry {
  name: MacroKey;
  value: number;   // grams
  kcal: number;
}

function kcalFromMacro(name: MacroKey, grams: number): number {
  if (name === 'Protein') return grams * 4;
  if (name === 'Carbs')   return grams * 4;
  return grams * 9; // Fat
}

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const entry = payload[0].payload as MacroEntry;
  return (
    <div className="rounded-xl border border-steel-200 bg-plate p-3 shadow-md text-xs">
      <p className="font-semibold" style={{ color: MACRO_COLORS[entry.name] }}>
        {entry.name}
      </p>
      <p className="text-ink/80 tabular-nums">{entry.value.toFixed(1)} g</p>
      <p className="text-ink/60 tabular-nums">{entry.kcal} kcal</p>
      <p className="text-[10px] text-ink/40 mt-1 italic">*estimated</p>
    </div>
  );
}

interface MacroChartProps {
  proteinG: number;
  carbsG: number;
  fatG: number;
}

export default function MacroChart({ proteinG, carbsG, fatG }: MacroChartProps) {
  const data: MacroEntry[] = [
    { name: 'Protein' as MacroKey, value: proteinG, kcal: Math.round(kcalFromMacro('Protein', proteinG)) },
    { name: 'Carbs' as MacroKey,   value: carbsG,   kcal: Math.round(kcalFromMacro('Carbs', carbsG)) },
    { name: 'Fat' as MacroKey,     value: fatG,     kcal: Math.round(kcalFromMacro('Fat', fatG)) },
  ].filter((d) => d.value > 0);

  const totalKcal = data.reduce((sum, d) => sum + d.kcal, 0);
  const totalG    = data.reduce((sum, d) => sum + d.value, 0);

  if (totalG === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-ink/40 text-sm">
        No macro data for this period
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={65}
            outerRadius={95}
            paddingAngle={3}
            startAngle={90}
            endAngle={-270}
            label={false}
          >
            {data.map((entry) => (
              <Cell key={entry.name} fill={MACRO_COLORS[entry.name]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>

      {/* Manual center label */}
      <div className="relative -mt-[220px] pointer-events-none flex items-center justify-center h-[220px]">
        <div className="text-center">
          <p className="text-xl font-heading font-bold text-ink tabular-nums">{totalKcal}</p>
          <p className="text-[11px] text-ink/50">total kcal</p>
        </div>
      </div>

      {/* Legend */}
      <div className="grid grid-cols-3 gap-2 text-center text-xs pt-4 border-t border-steel-100">
        {data.map((item) => {
          const pct = Math.round((item.kcal / totalKcal) * 100);
          return (
            <div key={item.name} className="space-y-0.5">
              <div className="flex items-center justify-center gap-1.5 font-medium text-ink">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: MACRO_COLORS[item.name] }}
                />
                {item.name}
              </div>
              <p className="text-ink/60 text-[11px] tabular-nums">{pct}% • {item.value.toFixed(0)}g</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
