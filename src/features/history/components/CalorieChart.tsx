'use client';

import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export interface CalorieChartDataPoint {
  date: string;       // display label e.g. "Oct 25"
  caloriesIn: number;
  caloriesOut: number;
  goal: number;
}

interface CustomTooltipPayload {
  dataKey: string;
  name: string;
  value: number;
  color: string;
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;

  const items = payload as CustomTooltipPayload[];

  return (
    <div className="rounded-xl border border-steel-200 bg-plate p-3 shadow-md text-xs">
      <p className="font-semibold text-ink mb-1">{label}</p>
      {items.map((entry) => (
        <p key={entry.dataKey} style={{ color: entry.color }} className="leading-5 tabular-nums">
          {entry.name}: <span className="font-medium">{entry.value.toLocaleString()} kcal</span>
        </p>
      ))}
      <p className="text-[10px] text-ink/40 mt-1 italic">*estimated</p>
    </div>
  );
}

interface CalorieChartProps {
  data: CalorieChartDataPoint[];
}

export default function CalorieChart({ data }: CalorieChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <ComposedChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#EDF0F1" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11, fill: '#6B7280' }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: '#6B7280' }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v: number) => `${v}`}
          label={{
            value: 'kcal',
            angle: -90,
            position: 'insideLeft',
            offset: 10,
            style: { fontSize: 11, fill: '#9CA3AF' },
          }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
          formatter={(value: string) => (
            <span className="text-ink/70 font-medium">{value}</span>
          )}
        />

        {/* Consumed calories bar — Curry leaf / Neel */}
        <Bar
          dataKey="caloriesIn"
          name="Calories In"
          fill="#327349"
          radius={[4, 4, 0, 0]}
          maxBarSize={36}
          fillOpacity={0.9}
        />

        {/* Dashed Haldi line — daily goal */}
        <Line
          dataKey="goal"
          name="Daily Goal"
          type="monotone"
          stroke="#F2B01E"
          strokeWidth={2}
          strokeDasharray="6 4"
          dot={false}
          activeDot={{ r: 4, fill: '#F2B01E' }}
        />

        {/* Chukandar line — calories burned (no harsh red) */}
        <Line
          dataKey="caloriesOut"
          name="Calories Burned"
          type="monotone"
          stroke="#B1275B"
          strokeWidth={2}
          dot={{ r: 3, fill: '#B1275B' }}
          activeDot={{ r: 5 }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
