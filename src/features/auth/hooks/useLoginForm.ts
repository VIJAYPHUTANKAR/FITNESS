'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getSafeRedirectUrl } from '@/lib/auth/routes';
import { signInUser } from '../services/authService';

/**
 * Hook managing login form state and submission with safe redirect protection.
 */
export function useLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const rawNext = searchParams.get('next') || searchParams.get('redirect') || searchParams.get('returnTo');
  const targetRedirect = getSafeRedirectUrl(rawNext, '/dashboard');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { error: authError } = await signInUser({ email, password });

      if (authError) {
        setError(authError.message);
        return;
      }

      router.push(targetRedirect);
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return {
    email,
    setEmail,
    password,
    setPassword,
    error,
    loading,
    handleSubmit,
  };
}
