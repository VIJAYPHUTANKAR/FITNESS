import { createClient } from '@/lib/supabase/client';
import { todayISO } from '@/lib/dates';
import type { ProfileFormInput } from '@/lib/validation/schemas';

interface SaveOnboardingPayload {
  userId: string;
  profileData: ProfileFormInput;
  weightKg: number;
}

/**
 * Saves initial profile data and logs initial weigh-in entry during onboarding.
 */
export async function saveOnboardingProfile({ userId, profileData, weightKg }: SaveOnboardingPayload) {
  const supabase = createClient();

  const { error: profileErr } = await supabase
    .from('profiles')
    .upsert({
      id: userId,
      ...profileData,
    });

  if (profileErr) {
    return { error: profileErr };
  }

  const { error: weightErr } = await supabase.from('weight_logs').upsert(
    {
      user_id: userId,
      logged_on: todayISO(),
      weight_kg: weightKg,
    },
    { onConflict: 'user_id,logged_on' }
  );

  return { error: weightErr || null };
}
