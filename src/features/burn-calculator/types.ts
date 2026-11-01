import type { Profile, BurnPlan } from '@/types/database';
import type { BurnResult, Exercise } from '@/lib/calc/burn';

export type { Profile, BurnPlan, BurnResult, Exercise };

export interface SaveBurnPlanPayload {
  calories_to_burn: number;
  days: number;
  plan: BurnResult[];
}
