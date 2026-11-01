import { createClient } from '@/lib/supabase/client';
import type { ProfileFormInput } from '@/lib/validation/schemas';

interface SaveOnboardingPayload {
  userId: string;
  profileData: ProfileFormInput;
  weightKg: number;
  loggedOn: string;
}

/**
 * Saves initial profile data and logs initial weigh-in entry during onboarding.
 * Requires client-computed loggedOn string to prevent timezone discrepancies.
 */
export async function saveOnboardingProfile({
  userId,
  profileData,
  weightKg,
  loggedOn,
}: SaveOnboardingPayload) {
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
      logged_on: loggedOn,
      weight_kg: weightKg,
    },
    { onConflict: 'user_id,logged_on' }
  );

  return { error: weightErr || null };
}
