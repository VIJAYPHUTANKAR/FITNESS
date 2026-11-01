'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ThemeToggle } from '@/components/layout';
import { useLoginForm } from '../hooks/useLoginForm';

function LoginForm() {
  const {
    email,
    setEmail,
    password,
    setPassword,
    error,
    loading,
    handleSubmit,
  } = useLoginForm();

  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="w-full max-w-md mx-auto p-6 sm:p-8 rounded-[20px] bg-[var(--color-plate)] border border-[var(--color-border)] shadow-xs">
      <div className="mb-6 text-left">
        <Link href="/" className="inline-flex items-center gap-2 mb-4">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--color-neel)] text-[var(--color-haldi)] font-heading font-bold text-xs">
            FC
          </div>
          <span className="font-heading text-base font-bold text-[var(--color-neel)]">
            FitCalc
          </span>
        </Link>
        <h1 className="font-heading text-2xl font-bold text-[var(--color-neel)]">
          Welcome back
        </h1>
        <p className="mt-1 text-xs text-[var(--color-neel-muted)]">
          Sign in to access your logs and daily nutrition plate.
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
            id="login-email"
            label="Email address"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </div>

        <div className="relative">
          <Input
            id="login-password"
            label="Password"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            className="absolute right-3 top-8 text-[var(--color-neel-muted)] hover:text-[var(--color-neel)] p-1 min-h-[36px] min-w-[36px] flex items-center justify-center"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
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
              Signing in...
            </>
          ) : (
            'Sign In'
          )}
        </Button>
      </form>

      <p className="mt-6 text-center text-xs text-[var(--color-neel-muted)]">
        Don&apos;t have an account?{' '}
        <Link
          href="/signup"
          className="font-semibold text-[var(--color-neel)] underline hover:opacity-80"
        >
          Sign up
        </Link>
      </p>
    </div>
  );
}

export function LoginScreen() {
  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-[var(--color-steel)] text-[var(--color-neel)]">
      {/* Form column */}
      <div className="flex flex-col justify-between p-6 sm:p-12">
        <div className="flex justify-end">
          <ThemeToggle />
        </div>
        <div className="flex items-center justify-center my-auto py-8">
          <Suspense fallback={<div className="text-center text-xs text-[var(--color-neel-muted)]">Loading form...</div>}>
            <LoginForm />
          </Suspense>
        </div>
        <p className="text-center text-[11px] text-[var(--color-neel-muted)]/70">
          Estimated values only · Not medical advice
        </p>
      </div>

      {/* Quiet side panel on wide screens */}
      <div className="hidden lg:flex flex-col justify-between p-12 bg-[var(--color-plate)] border-l border-[var(--color-border)]">
        <div className="space-y-4 max-w-md my-auto">
          <span className="text-[11px] font-bold tracking-wider text-[var(--color-haldi)] uppercase">
            Everyday nutrition
          </span>
          <h2 className="font-heading text-3xl font-extrabold text-[var(--color-neel)] leading-tight">
            Log what you actually eat, without the Western guesswork.
          </h2>
          <p className="text-xs text-[var(--color-neel-muted)] leading-relaxed">
            Real portions for roti, dal, sabzi, and poha. Balanced calories and macronutrients on a traditional Thali plate.
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs text-[var(--color-neel-muted)]">
          <span className="h-2 w-2 rounded-full bg-[var(--color-patta)]" />
          <span>Science-backed energy balance model</span>
        </div>
      </div>
    </div>
  );
}
