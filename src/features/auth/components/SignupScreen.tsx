'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, Eye, EyeOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
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

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  if (success) {
    return (
      <div className="w-full max-w-md mx-auto">
        <div className="rounded-[24px] bg-[var(--color-plate)] border border-[var(--color-border)] p-6 sm:p-8 text-center space-y-4 shadow-xs transition-colors">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-steel)] text-[var(--color-neel)] mx-auto">
            <Mail className="h-6 w-6" />
          </div>
          <h2 className="font-heading text-xl font-bold text-[var(--color-neel)]">
            Check your email
          </h2>
          <p className="text-xs text-[var(--color-neel-muted)] max-w-xs mx-auto leading-relaxed">
            We&apos;ve sent a confirmation link to{' '}
            <strong className="text-[var(--color-neel)]">{email}</strong>. Click the link to activate your account.
          </p>
          <div className="pt-2">
            <Link
              href="/login"
              className="inline-flex items-center justify-center px-5 py-2.5 text-xs font-semibold rounded-[10px] bg-[var(--color-neel)] text-[var(--color-plate)] dark:text-[#12142B] min-h-[44px] hover:opacity-90 transition-opacity"
            >
              Back to sign in
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="rounded-[24px] bg-[var(--color-plate)] border border-[var(--color-border)] p-6 sm:p-8 shadow-xs transition-colors">
        <div className="mb-6 text-left">
          <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-[var(--color-neel)] tracking-tight">
            Create your account
          </h1>
          <p className="mt-1.5 text-xs sm:text-sm text-[var(--color-neel-muted)] leading-relaxed">
            Track Indian meals, macros, and energy with clarity.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-[10px] bg-[var(--color-chukandar-subtle)] border border-[var(--color-chukandar)]/20 p-3 text-xs font-semibold text-[var(--color-chukandar)]">
              {error}
            </div>
          )}

          <div>
            <Input
              id="fullName"
              label="Full name"
              type="text"
              autoComplete="name"
              required
              placeholder="Priya Sharma"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>

          <div>
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
          </div>

          <div className="relative">
            <Input
              id="password"
              label="Password (min 8 characters)"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="absolute right-3 top-8 text-[var(--color-neel-muted)] hover:text-[var(--color-neel)] p-1 min-h-[36px] min-w-[36px] flex items-center justify-center transition-colors"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          <div className="relative">
            <Input
              id="confirmPassword"
              label="Confirm password"
              type={showConfirm ? 'text' : 'password'}
              autoComplete="new-password"
              required
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              aria-label={showConfirm ? 'Hide confirm password' : 'Show confirm password'}
              className="absolute right-3 top-8 text-[var(--color-neel-muted)] hover:text-[var(--color-neel)] p-1 min-h-[36px] min-w-[36px] flex items-center justify-center transition-colors"
            >
              {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          <Button
            type="submit"
            className="w-full mt-2"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                Creating account...
              </>
            ) : (
              'Create Account'
            )}
          </Button>
        </form>

        <div className="mt-6 pt-5 border-t border-[var(--color-border)] text-center text-xs text-[var(--color-neel-muted)]">
          Already have an account?{' '}
          <Link
            href="/login"
            className="font-semibold text-[var(--color-neel)] underline hover:opacity-80"
          >
            Sign in
          </Link>
        </div>
      </div>

      <div className="mt-4 text-center">
        <p className="inline-flex items-center gap-1.5 text-[11px] text-[var(--color-neel-muted)]">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-patta)]" />
          Strict 18+ health safety · Export or delete your data anytime
        </p>
      </div>
    </div>
  );
}
