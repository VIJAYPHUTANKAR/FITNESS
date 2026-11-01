import type { Food } from '@/types/database';

export type { Food };

export interface CustomFoodInput {
  name: string;
  brand?: string | null;
  serving_desc: string;
  serving_grams: number;
  calories_per_100g: number;
  protein_g?: number | null;
  carbs_g?: number | null;
  fat_g?: number | null;
  fiber_g?: number | null;
}
