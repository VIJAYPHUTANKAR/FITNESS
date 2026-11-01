'use client';

import * as React from 'react';
import { Badge } from '@/components/ui';

export interface ThaliPlateProps {
  caloriesIn: number;
  goal: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
}

export function ThaliPlate({
  caloriesIn,
  goal,
  proteinG,
  carbsG,
  fatG,
}: ThaliPlateProps) {
  const isOverGoal = caloriesIn > goal;
  const diffFromGoal = Math.abs(caloriesIn - goal);

  const totalMacroGrams = proteinG + carbsG + fatG;
  const hasFood = totalMacroGrams > 0 || caloriesIn > 0;

  // Macro shares
  const pShare = hasFood ? proteinG / Math.max(1, totalMacroGrams) : 0;
  const cShare = hasFood ? carbsG / Math.max(1, totalMacroGrams) : 0;
  const fShare = hasFood ? fatG / Math.max(1, totalMacroGrams) : 0;

  // SVG perimeter calculations (radius = 90, circumference ~ 565.48)
  const radius = 90;
  const circumference = 2 * Math.PI * radius;

  // Length of segments
  const pLength = hasFood ? Math.max(12, pShare * circumference) : 0;
  const cLength = hasFood ? Math.max(12, cShare * circumference) : 0;
  const fLength = hasFood ? Math.max(12, fShare * circumference) : 0;

  const pOffset = 0;
  const cOffset = -pLength;
  const fOffset = -(pLength + cLength);

  return (
    <div className="w-full rounded-[24px] bg-[var(--color-plate)] border border-[var(--color-border)] p-6 sm:p-8 flex flex-col items-center text-center">
      <div className="w-full flex items-center justify-between pb-3 border-b border-[var(--color-border-subtle)] text-left">
        <div>
          <h2 className="font-heading text-lg font-bold text-[var(--color-neel)]">
            The Thali Plate
          </h2>
          <p className="text-xs text-[var(--color-neel-muted)]">
            Daily Goal: <span className="font-semibold text-[var(--color-neel)] tabular-nums">{goal} kcal</span>
          </p>
        </div>
        <Badge variant={isOverGoal ? 'neutral' : 'haldi'} size="sm">
          {isOverGoal ? `${diffFromGoal} kcal above target` : `${diffFromGoal} kcal remaining`}
        </Badge>
      </div>

      {/* Screen reader summary */}
      <div className="sr-only">
        {hasFood
          ? `${caloriesIn} calories eaten of ${goal} kcal daily goal. Macros: ${proteinG} grams protein, ${carbsG} grams carbohydrates, ${fatG} grams fat.`
          : `Nothing logged yet. Daily goal is ${goal} calories.`}
      </div>

      {/* SVG Plate */}
      <div className="relative flex items-center justify-center my-6">
        <svg
          viewBox="0 0 240 240"
          className="w-60 h-60 sm:w-72 sm:h-72"
          role="img"
          aria-label={`Thali nutrition plate showing ${caloriesIn} of ${goal} kcal`}
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

          {/* Rim Katoris */}
          {hasFood ? (
            <g transform="rotate(-90 120 120)">
              {/* Protein Segment (Chukandar) */}
              <circle
                cx="120"
                cy="120"
                r={radius}
                fill="none"
                stroke="var(--color-chukandar)"
                strokeWidth="14"
                strokeDasharray={`${pLength} ${circumference}`}
                strokeDashoffset={pOffset}
                strokeLinecap="round"
                style={{
                  transition: 'stroke-dasharray 0.5s ease, stroke-dashoffset 0.5s ease',
                }}
              />
              {/* Carbs Segment (Haldi) */}
              <circle
                cx="120"
                cy="120"
                r={radius}
                fill="none"
                stroke="var(--color-haldi)"
                strokeWidth="14"
                strokeDasharray={`${cLength} ${circumference}`}
                strokeDashoffset={cOffset}
                strokeLinecap="round"
                style={{
                  transition: 'stroke-dasharray 0.5s ease, stroke-dashoffset 0.5s ease',
                }}
              />
              {/* Fat Segment (Patta) */}
              <circle
                cx="120"
                cy="120"
                r={radius}
                fill="none"
                stroke="var(--color-patta)"
                strokeWidth="14"
                strokeDasharray={`${fLength} ${circumference}`}
                strokeDashoffset={fOffset}
                strokeLinecap="round"
                style={{
                  transition: 'stroke-dasharray 0.5s ease, stroke-dashoffset 0.5s ease',
                }}
              />
            </g>
          ) : (
            <circle
              cx="120"
              cy="120"
              r={radius}
              fill="none"
              stroke="var(--color-border)"
              strokeWidth="4"
              strokeDasharray="4 6"
            />
          )}

          {/* Center Plate Hub */}
          <circle
            cx="120"
            cy="120"
            r="60"
            fill="var(--color-steel)"
            stroke="var(--color-border)"
            strokeWidth="1.5"
          />

          {/* Center Content */}
          {hasFood ? (
            <>
              <text
                x="120"
                y="112"
                textAnchor="middle"
                className="font-heading font-extrabold fill-[var(--color-neel)]"
                fontSize="32"
              >
                {caloriesIn}
              </text>
              <text
                x="120"
                y="132"
                textAnchor="middle"
                className="font-sans font-semibold fill-[var(--color-neel-muted)]"
                fontSize="11"
              >
                of {goal} kcal goal
              </text>
              {isOverGoal && (
                <text
                  x="120"
                  y="146"
                  textAnchor="middle"
                  className="font-sans fill-[var(--color-neel-muted)]"
                  fontSize="9"
                >
                  above goal
                </text>
              )}
            </>
          ) : (
            <>
              <text
                x="120"
                y="118"
                textAnchor="middle"
                className="font-heading font-bold fill-[var(--color-neel-muted)]"
                fontSize="13"
              >
                Nothing logged yet
              </text>
              <text
                x="120"
                y="136"
                textAnchor="middle"
                className="font-sans fill-[var(--color-neel-muted)]"
                fontSize="10"
              >
                Goal: {goal} kcal
              </text>
            </>
          )}
        </svg>
      </div>

      {/* Rim Macro Legend */}
      <div className="w-full grid grid-cols-3 gap-2.5 pt-3 border-t border-[var(--color-border-subtle)] text-center">
        <div className="p-2.5 rounded-[12px] bg-[var(--color-steel)] border border-[var(--color-border-subtle)]">
          <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-[var(--color-chukandar)]">
            <span className="h-2 w-2 rounded-full bg-[var(--color-chukandar)]" />
            Protein
          </div>
          <p className="font-heading font-bold text-sm text-[var(--color-neel)] tabular-nums mt-0.5">
            {proteinG}g
          </p>
        </div>

        <div className="p-2.5 rounded-[12px] bg-[var(--color-steel)] border border-[var(--color-border-subtle)]">
          <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-[#7A4B00] dark:text-[#F7C966]">
            <span className="h-2 w-2 rounded-full bg-[var(--color-haldi)]" />
            Carbs
          </div>
          <p className="font-heading font-bold text-sm text-[var(--color-neel)] tabular-nums mt-0.5">
            {carbsG}g
          </p>
        </div>

        <div className="p-2.5 rounded-[12px] bg-[var(--color-steel)] border border-[var(--color-border-subtle)]">
          <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-[var(--color-patta)]">
            <span className="h-2 w-2 rounded-full bg-[var(--color-patta)]" />
            Fat
          </div>
          <p className="font-heading font-bold text-sm text-[var(--color-neel)] tabular-nums mt-0.5">
            {fatG}g
          </p>
        </div>
      </div>
    </div>
  );
}
