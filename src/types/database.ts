// src/types/database.ts
// Hand-crafted types matching the Supabase schema.

export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          date_of_birth: string | null;
          gender: 'male' | 'female' | 'other' | null;
          height_cm: number | null;
          weight_kg: number | null;
          activity_level: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active' | null;
          goal_type: 'lose' | 'maintain' | 'gain' | null;
          daily_calorie_goal: number | null;
          created_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          date_of_birth?: string | null;
          gender?: 'male' | 'female' | 'other' | null;
          height_cm?: number | null;
          weight_kg?: number | null;
          activity_level?: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active' | null;
          goal_type?: 'lose' | 'maintain' | 'gain' | null;
          daily_calorie_goal?: number | null;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
        Relationships: [];
      };
      foods: {
        Row: {
          id: number;
          user_id: string | null;
          name: string;
          brand: string | null;
          serving_desc: string | null;
          serving_grams: number | null;
          calories_per_100g: number;
          protein_g: number | null;
          carbs_g: number | null;
          fat_g: number | null;
          fiber_g: number | null;
          source: string | null;
          external_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: number;
          user_id?: string | null;
          name: string;
          brand?: string | null;
          serving_desc?: string | null;
          serving_grams?: number | null;
          calories_per_100g: number;
          protein_g?: number | null;
          carbs_g?: number | null;
          fat_g?: number | null;
          fiber_g?: number | null;
          source?: string | null;
          external_id?: string | null;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['foods']['Insert']>;
        Relationships: [];
      };
      food_logs: {
        Row: {
          id: number;
          user_id: string;
          food_id: number | null;
          food_name: string;
          logged_on: string;
          meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack' | null;
          quantity_grams: number;
          calories: number;
          protein_g: number | null;
          carbs_g: number | null;
          fat_g: number | null;
          created_at: string;
        };
        Insert: {
          id?: number;
          user_id: string;
          food_id?: number | null;
          food_name: string;
          logged_on?: string;
          meal_type?: 'breakfast' | 'lunch' | 'dinner' | 'snack' | null;
          quantity_grams: number;
          calories: number;
          protein_g?: number | null;
          carbs_g?: number | null;
          fat_g?: number | null;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['food_logs']['Insert']>;
        Relationships: [];
      };
      exercises: {
        Row: {
          id: number;
          name: string;
          category: string | null;
          met: number;
          intensity: string | null;
          equipment_needed: boolean;
        };
        Insert: {
          id?: number;
          name: string;
          category?: string | null;
          met: number;
          intensity?: string | null;
          equipment_needed?: boolean;
        };
        Update: Partial<Database['public']['Tables']['exercises']['Insert']>;
        Relationships: [];
      };
      exercise_logs: {
        Row: {
          id: number;
          user_id: string;
          exercise_id: number | null;
          exercise_name: string;
          logged_on: string;
          duration_min: number;
          calories_burned: number;
          created_at: string;
        };
        Insert: {
          id?: number;
          user_id: string;
          exercise_id?: number | null;
          exercise_name: string;
          logged_on?: string;
          duration_min: number;
          calories_burned: number;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['exercise_logs']['Insert']>;
        Relationships: [];
      };
      weight_logs: {
        Row: {
          id: number;
          user_id: string;
          logged_on: string;
          weight_kg: number;
        };
        Insert: {
          id?: number;
          user_id: string;
          logged_on?: string;
          weight_kg: number;
        };
        Update: Partial<Database['public']['Tables']['weight_logs']['Insert']>;
        Relationships: [];
      };
      burn_plans: {
        Row: {
          id: number;
          user_id: string;
          calories_to_burn: number;
          days: number;
          plan: Json;
          created_at: string;
        };
        Insert: {
          id?: number;
          user_id: string;
          calories_to_burn: number;
          days?: number;
          plan: Json;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['burn_plans']['Insert']>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}

// Convenience aliases
export type Profile      = Database['public']['Tables']['profiles']['Row'];
export type Food         = Database['public']['Tables']['foods']['Row'];
export type FoodLog      = Database['public']['Tables']['food_logs']['Row'];
export type Exercise     = Database['public']['Tables']['exercises']['Row'];
export type ExerciseLog  = Database['public']['Tables']['exercise_logs']['Row'];
export type WeightLog    = Database['public']['Tables']['weight_logs']['Row'];
export type BurnPlan     = Database['public']['Tables']['burn_plans']['Row'];

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';
