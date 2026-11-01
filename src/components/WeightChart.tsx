'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  type TooltipProps,
} from 'recharts';

export interface WeightChartDataPoint {
  date: string;   // display label e.g. "Oct 25"
  weight: number; // in kg (or the supplied unit)
}

function getTrend(data: WeightChartDataPoint[]): {
  emoji: string;
  label: string;
  color: string;
} {
  if (data.length < 2) return { emoji: '➡️', label: 'Not enough data', color: 'text-gray-500' };
  const first = data[0].weight;
  const last = data[data.length - 1].weight;
  const diff = last - first;
  if (Math.abs(diff) < 0.1) return { emoji: '➡️', label: 'Stable', color: 'text-gray-500' };
  if (diff > 0) return { emoji: '📈', label: `+${diff.toFixed(1)} kg over period`, color: 'text-red-500' };
  return { emoji: '📉', label: `${diff.toFixed(1)} kg over period`, color: 'text-green-500' };
}

/** Simple linear regression to generate trend line points */
function computeTrendLine(data: WeightChartDataPoint[]): WeightChartDataPoint[] {
  if (data.length < 2) return data;
  const n = data.length;
  const sumX = data.reduce((acc, _, i) => acc + i, 0);
  const sumY = data.reduce((acc, d) => acc + d.weight, 0);
  const sumXY = data.reduce((acc, d, i) => acc + i * d.weight, 0);
  const sumX2 = data.reduce((acc, _, i) => acc + i * i, 0);
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  return data.map((d, i) => ({
    date: d.date,
    weight: parseFloat((slope * i + intercept).toFixed(2)),
  }));
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-lg text-sm">
      <p className="font-semibold text-gray-700 mb-1">{label}</p>
      {payload.map((entry: any) => (
        <p key={entry.name} style={{ color: entry.color ?? '#6366f1' }} className="leading-5">
          {entry.name}:{' '}
          <span className="font-medium">{(entry.value as number).toFixed(1)} kg</span>
        </p>
      ))}
      <p className="text-xs text-gray-400 mt-1 italic">*estimated</p>
    </div>
  );
}

interface WeightChartProps {
  data: WeightChartDataPoint[];
  unit?: string;
}

export default function WeightChart({ data, unit = 'kg' }: WeightChartProps) {
  const trend = getTrend(data);
  const trendData = computeTrendLine(data);

  // Merge actual + trend into one dataset for the chart
  const merged = data.map((d, i) => ({
    date: d.date,
    weight: d.weight,
    trend: trendData[i]?.weight,
  }));

  const weights = data.map((d) => d.weight);
  const minW = weights.length ? Math.floor(Math.min(...weights) - 1) : 0;
  const maxW = weights.length ? Math.ceil(Math.max(...weights) + 1) : 100;

  return (
    <div className="space-y-2">
      {/* Trend indicator */}
      <div className={`flex items-center gap-2 text-sm font-medium ${trend.color}`}>
        <span className="text-lg">{trend.emoji}</span>
        <span>{trend.label}</span>
        <span className="text-xs text-gray-400 font-normal italic">*estimated</span>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={merged} margin={{ top: 8, right: 16, left: 0, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: '#6b7280' }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            domain={[minW, maxW]}
            tick={{ fontSize: 11, fill: '#6b7280' }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v: number) => `${v}`}
            label={{
              value: unit,
              angle: -90,
              position: 'insideLeft',
              offset: 10,
              style: { fontSize: 11, fill: '#9ca3af' },
            }}
          />
          <Tooltip content={<CustomTooltip />} />

          {/* Actual weight line */}
          <Line
            dataKey="weight"
            name="Weight"
            type="monotone"
            stroke="#6366f1"
            strokeWidth={2.5}
            dot={{ r: 4, fill: '#6366f1', strokeWidth: 0 }}
            activeDot={{ r: 6 }}
            connectNulls
          />

          {/* Trend line */}
          <Line
            dataKey="trend"
            name="Trend"
            type="monotone"
            stroke="#a5b4fc"
            strokeWidth={1.5}
            strokeDasharray="5 4"
            dot={false}
            activeDot={false}
            connectNulls
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
