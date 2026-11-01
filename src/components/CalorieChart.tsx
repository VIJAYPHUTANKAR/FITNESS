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
    <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-lg text-sm">
      <p className="font-semibold text-gray-700 mb-1">{label}</p>
      {items.map((entry) => (
        <p key={entry.dataKey} style={{ color: entry.color }} className="leading-5">
          {entry.name}: <span className="font-medium">{entry.value.toLocaleString()} kcal</span>
        </p>
      ))}
      <p className="text-xs text-gray-400 mt-1 italic">*estimated</p>
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
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11, fill: '#6b7280' }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: '#6b7280' }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v: number) => `${v}`}
          label={{
            value: 'kcal',
            angle: -90,
            position: 'insideLeft',
            offset: 10,
            style: { fontSize: 11, fill: '#9ca3af' },
          }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
          formatter={(value: string) => (
            <span className="text-gray-600">{value}</span>
          )}
        />

        {/* Green bars — calories consumed */}
        <Bar
          dataKey="caloriesIn"
          name="Calories In"
          fill="#22c55e"
          radius={[4, 4, 0, 0]}
          maxBarSize={40}
          fillOpacity={0.85}
        />

        {/* Dashed orange line — daily goal */}
        <Line
          dataKey="goal"
          name="Daily Goal"
          type="monotone"
          stroke="#f97316"
          strokeWidth={2}
          strokeDasharray="6 4"
          dot={false}
          activeDot={{ r: 4, fill: '#f97316' }}
        />

        {/* Red line — calories burned */}
        <Line
          dataKey="caloriesOut"
          name="Calories Burned"
          type="monotone"
          stroke="#ef4444"
          strokeWidth={2}
          dot={{ r: 3, fill: '#ef4444' }}
          activeDot={{ r: 5 }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
