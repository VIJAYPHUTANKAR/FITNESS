/**
 * SignupScreen: User registration form with confirmation message and validation.
 * Rendered by src/app/(auth)/signup/page.tsx.
 */

'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { useSignupForm } from '../hooks/useSignupForm';

export function SignupScreen() {
  const {
    fullName,
    setFullName,
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    error,
    success,
    loading,
    handleSubmit,
  } = useSignupForm();

  if (success) {
    return (
      <Card className="w-full max-w-md text-center">
        <div className="flex flex-col items-center gap-4 py-4">
          <span className="text-5xl">📬</span>
          <h2 className="text-xl font-bold text-gray-900">Check your email</h2>
          <p className="text-gray-500 text-sm max-w-xs">
            We&apos;ve sent a confirmation link to{' '}
            <span className="font-semibold text-gray-700">{email}</span>. Click the link to
            activate your account.
          </p>
          <Link
            href="/login"
            className="mt-2 text-sm font-semibold text-emerald-700 hover:text-emerald-600 transition-colors"
          >
            Back to Sign In →
          </Link>
        </div>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900">Create your account</h1>
        <p className="mt-1 text-sm text-gray-500">Free forever. No credit card needed.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          id="fullName"
          label="Full name"
          type="text"
          autoComplete="name"
          required
          placeholder="Alex Johnson"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />

        <Input
          id="email"
          label="Email address"
          type="email"
          autoComplete="email"
          required
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <Input
          id="password"
          label="Password"
          type="password"
          autoComplete="new-password"
          required
          placeholder="Min. 6 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <Input
          id="confirmPassword"
          label="Confirm password"
          type="password"
          autoComplete="new-password"
          required
          placeholder="Re-enter your password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          error={
            confirmPassword && confirmPassword !== password
              ? 'Passwords do not match'
              : undefined
          }
        />

        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <Button type="submit" variant="primary" className="w-full" disabled={loading}>
          {loading ? 'Creating account…' : 'Create Account'}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        Already have an account?{' '}
        <Link
          href="/login"
          className="font-semibold text-emerald-700 hover:text-emerald-600 transition-colors"
        >
          Sign in
        </Link>
      </p>
    </Card>
  );
}
