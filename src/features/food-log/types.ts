import type { FoodLog, MealType } from '@/types/database';

export type { FoodLog, MealType };

export interface FoodSearchResult {
  id?: number;
  name: string;
  brand?: string | null;
  serving_desc: string;
  serving_grams: number;
  calories_per_100g: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  source: string;
}

export interface MealSectionConfig {
  type: MealType;
  title: string;
  icon: string;
}
