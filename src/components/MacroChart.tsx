'use client';

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  type TooltipProps,
} from 'recharts';

const MACRO_COLORS = {
  Protein: '#3b82f6',   // blue
  Carbs:   '#eab308',   // yellow
  Fat:     '#f97316',   // orange
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
    <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-lg text-sm">
      <p className="font-semibold" style={{ color: MACRO_COLORS[entry.name] }}>
        {entry.name}
      </p>
      <p className="text-gray-600">{entry.value.toFixed(1)} g</p>
      <p className="text-gray-500">{entry.kcal} kcal</p>
      <p className="text-xs text-gray-400 mt-1 italic">*estimated</p>
    </div>
  );
}

/** Center label rendered inside the pie hole */
function CenterLabel({
  cx,
  cy,
  totalKcal,
}: {
  cx: number;
  cy: number;
  totalKcal: number;
}) {
  return (
    <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle">
      <tspan x={cx} dy="-0.5em" fontSize={20} fontWeight="700" fill="#111827">
        {totalKcal.toLocaleString()}
      </tspan>
      <tspan x={cx} dy="1.4em" fontSize={11} fill="#9ca3af">
        kcal*
      </tspan>
    </text>
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
      <div className="flex items-center justify-center h-40 text-gray-400 text-sm">
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
          {/* We rely on a foreignObject trick — instead, render a plain SVG text element via the Recharts label prop on Pie. */}
        </PieChart>
      </ResponsiveContainer>

      {/* Manual center label (overlaid absolutely) */}
      <div className="relative -mt-[220px] pointer-events-none flex items-center justify-center h-[220px]">
        <div className="text-center">
          <p className="text-xl font-bold text-gray-900">{totalKcal.toLocaleString()}</p>
          <p className="text-xs text-gray-400 italic">kcal*</p>
        </div>
      </div>

      {/* Custom legend */}
      <div className="flex justify-center gap-6 flex-wrap text-sm">
        {data.map((entry) => {
          const pct = totalG > 0 ? ((entry.value / totalG) * 100).toFixed(0) : '0';
          return (
            <div key={entry.name} className="flex items-center gap-1.5">
              <span
                className="inline-block h-3 w-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: MACRO_COLORS[entry.name] }}
              />
              <span className="text-gray-700 font-medium">{entry.name}</span>
              <span className="text-gray-400">
                {entry.value.toFixed(0)}g · {pct}%
              </span>
            </div>
          );
        })}
      </div>

      <p className="text-center text-xs text-gray-400 italic">*estimated values</p>
    </div>
  );
}
