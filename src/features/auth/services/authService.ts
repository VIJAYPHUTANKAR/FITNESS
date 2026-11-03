import { createClient } from '@/lib/supabase/client';
import type { SignInCredentials, SignUpCredentials } from '../types';

/**
 * Signs in an existing user with email and password.
 */
export async function signInUser({ email, password }: SignInCredentials) {
  const supabase = createClient();
  return supabase.auth.signInWithPassword({
    email,
    password,
  });
}

/**
 * Registers a new user with email, password, and metadata.
 */
export async function signUpUser({ email, password, fullName }: SignUpCredentials) {
  const supabase = createClient();
  const redirectTo = typeof window !== 'undefined' ? `${window.location.origin}/dashboard` : undefined;

  return supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
      ...(redirectTo ? { emailRedirectTo: redirectTo } : {}),
    },
  });
}

/**
 * Signs out the currently authenticated user.
 */
export async function signOutUser() {
  const supabase = createClient();
  return supabase.auth.signOut();
}
