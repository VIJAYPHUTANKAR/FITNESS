'use client';

import * as React from 'react';
import { Badge } from '@/components/ui';

interface SampleFood {
  id: string;
  name: string;
  servingLabel: string;
  defaultGrams: number;
  kcalPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
}

const SAMPLE_FOODS: SampleFood[] = [
  {
    id: 'roti',
    name: 'Roti / Chapati',
    servingLabel: '2 rotis (~60g)',
    defaultGrams: 60,
    kcalPer100g: 264,
    proteinPer100g: 9,
    carbsPer100g: 55,
    fatPer100g: 3,
  },
  {
    id: 'dal',
    name: 'Dal Tadka',
    servingLabel: '1 katori (~150g)',
    defaultGrams: 150,
    kcalPer100g: 115,
    proteinPer100g: 7,
    carbsPer100g: 16,
    fatPer100g: 3,
  },
  {
    id: 'idli',
    name: 'Steamed Idli',
    servingLabel: '2 idlis (~120g)',
    defaultGrams: 120,
    kcalPer100g: 140,
    proteinPer100g: 4,
    carbsPer100g: 28,
    fatPer100g: 1,
  },
  {
    id: 'poha',
    name: 'Batata Poha',
    servingLabel: '1 plate (~150g)',
    defaultGrams: 150,
    kcalPer100g: 180,
    proteinPer100g: 3,
    carbsPer100g: 32,
    fatPer100g: 5,
  },
];

export function InteractivePlateDemo() {
  const [selectedId, setSelectedId] = React.useState('roti');
  const [grams, setGrams] = React.useState(60);

  const food = SAMPLE_FOODS.find((f) => f.id === selectedId) || SAMPLE_FOODS[0];

  const factor = grams / 100;
  const cals = Math.round(food.kcalPer100g * factor);
  const protein = Math.round(food.proteinPer100g * factor * 10) / 10;
  const carbs = Math.round(food.carbsPer100g * factor * 10) / 10;
  const fat = Math.round(food.fatPer100g * factor * 10) / 10;

  // Macro share ratios for rim segments
  const totalMacroGrams = Math.max(1, protein + carbs + fat);
  const pShare = protein / totalMacroGrams;
  const cShare = carbs / totalMacroGrams;
  const fShare = fat / totalMacroGrams;

  // SVG perimeter calculations (radius = 90, circumference ~ 565.48)
  const radius = 90;
  const circumference = 2 * Math.PI * radius;

  const pLength = Math.max(8, pShare * circumference);
  const cLength = Math.max(8, cShare * circumference);
  const fLength = Math.max(8, fShare * circumference);

  const pOffset = 0;
  const cOffset = -pLength;
  const fOffset = -(pLength + cLength);

  const handleSelectFood = (f: SampleFood) => {
    setSelectedId(f.id);
    setGrams(f.defaultGrams);
  };

  return (
    <div className="w-full max-w-xl mx-auto rounded-[24px] bg-[var(--color-plate)] border border-[var(--color-border)] p-6 sm:p-8 shadow-sm">
      <div className="flex items-center justify-between pb-4 border-b border-[var(--color-border-subtle)]">
        <div>
          <span className="text-[11px] font-bold text-[var(--color-neel-muted)] uppercase tracking-wider">
            Interactive demo
          </span>
          <h2 className="font-heading text-lg font-bold text-[var(--color-neel)]">
            The Thali Plate
          </h2>
        </div>
        <Badge variant="neutral" size="sm">
          Sample values
        </Badge>
      </div>

      {/* Food selector chips */}
      <div className="flex items-center gap-2 pt-4 pb-2 overflow-x-auto">
        {SAMPLE_FOODS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => handleSelectFood(item)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all min-h-[38px] shrink-0 ${
              item.id === selectedId
                ? 'bg-[var(--color-neel)] text-[var(--color-plate)] dark:text-[#12142B]'
                : 'bg-[var(--color-steel)] text-[var(--color-neel)] hover:bg-[var(--color-border)]'
            }`}
          >
            {item.name}
          </button>
        ))}
      </div>

      {/* Grams slider */}
      <div className="space-y-1.5 py-3">
        <div className="flex justify-between items-center text-xs font-medium text-[var(--color-neel-muted)]">
          <span>Portion</span>
          <span className="font-bold text-[var(--color-neel)] tabular-nums">{grams} grams</span>
        </div>
        <input
          type="range"
          min={30}
          max={300}
          step={5}
          value={grams}
          onChange={(e) => setGrams(Number(e.target.value))}
          aria-label="Portion size in grams"
          className="w-full accent-[var(--color-neel)] cursor-pointer h-2 bg-[var(--color-steel)] rounded-full"
        />
      </div>

      {/* Thali Plate SVG Visualization */}
      <div className="relative flex items-center justify-center py-6">
        <svg
          viewBox="0 0 240 240"
          className="w-56 h-56 sm:w-64 sm:h-64"
          aria-label={`Thali plate showing ${cals} calories for ${food.name}`}
          role="img"
        >
          {/* Outer plate edge */}
          <circle
            cx="120"
            cy="120"
            r="110"
            fill="var(--color-steel)"
            stroke="var(--color-border)"
            strokeWidth="2"
          />

          {/* Inner plate well */}
          <circle
            cx="120"
            cy="120"
            r="98"
            fill="var(--color-plate)"
            stroke="var(--color-border-subtle)"
            strokeWidth="1.5"
          />

          {/* Rim Katoris (Carbs - Haldi, Protein - Chukandar, Fat - Patta) */}
          <g transform="rotate(-90 120 120)">
            {/* Protein Segment */}
            <circle
              cx="120"
              cy="120"
              r={radius}
              fill="none"
              stroke="var(--color-chukandar)"
              strokeWidth="12"
              strokeDasharray={`${pLength} ${circumference}`}
              strokeDashoffset={pOffset}
              strokeLinecap="round"
            />
            {/* Carbs Segment */}
            <circle
              cx="120"
              cy="120"
              r={radius}
              fill="none"
              stroke="var(--color-haldi)"
              strokeWidth="12"
              strokeDasharray={`${cLength} ${circumference}`}
              strokeDashoffset={cOffset}
              strokeLinecap="round"
            />
            {/* Fat Segment */}
            <circle
              cx="120"
              cy="120"
              r={radius}
              fill="none"
              stroke="var(--color-patta)"
              strokeWidth="12"
              strokeDasharray={`${fLength} ${circumference}`}
              strokeDashoffset={fOffset}
              strokeLinecap="round"
            />
          </g>

          {/* Center Plate Hub */}
          <circle
            cx="120"
            cy="120"
            r="60"
            fill="var(--color-steel)"
            stroke="var(--color-border)"
            strokeWidth="1.5"
          />

          {/* Center Values */}
          <text
            x="120"
            y="114"
            textAnchor="middle"
            className="font-heading font-extrabold fill-[var(--color-neel)]"
            fontSize="32"
          >
            {cals}
          </text>
          <text
            x="120"
            y="134"
            textAnchor="middle"
            className="font-sans font-semibold fill-[var(--color-neel-muted)]"
            fontSize="11"
          >
            calories (kcal)
          </text>
          <text
            x="120"
            y="148"
            textAnchor="middle"
            className="font-sans fill-[var(--color-neel-muted)]"
            fontSize="9"
          >
            {food.name}
          </text>
        </svg>
      </div>

      {/* Katori Macro Breakdown Legend */}
      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[var(--color-border-subtle)] text-center">
        <div className="p-2 rounded-[12px] bg-[var(--color-steel)]">
          <div className="flex items-center justify-center gap-1.5 text-[11px] font-semibold text-[var(--color-chukandar)]">
            <span className="h-2 w-2 rounded-full bg-[var(--color-chukandar)]" />
            Protein
          </div>
          <p className="font-heading font-bold text-sm text-[var(--color-neel)] tabular-nums mt-0.5">
            {protein}g
          </p>
        </div>

        <div className="p-2 rounded-[12px] bg-[var(--color-steel)]">
          <div className="flex items-center justify-center gap-1.5 text-[11px] font-semibold text-[#7A4B00] dark:text-[#F7C966]">
            <span className="h-2 w-2 rounded-full bg-[var(--color-haldi)]" />
            Carbs
          </div>
          <p className="font-heading font-bold text-sm text-[var(--color-neel)] tabular-nums mt-0.5">
            {carbs}g
          </p>
        </div>

        <div className="p-2 rounded-[12px] bg-[var(--color-steel)]">
          <div className="flex items-center justify-center gap-1.5 text-[11px] font-semibold text-[var(--color-patta)]">
            <span className="h-2 w-2 rounded-full bg-[var(--color-patta)]" />
            Fat
          </div>
          <p className="font-heading font-bold text-sm text-[var(--color-neel)] tabular-nums mt-0.5">
            {fat}g
          </p>
        </div>
      </div>
    </div>
  );
}
