'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
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
    <div className="w-full max-w-md mx-auto">
      <div className="rounded-[24px] bg-[var(--color-plate)] border border-[var(--color-border)] p-6 sm:p-8 shadow-xs transition-colors">
        <div className="mb-6 text-left">
          <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-[var(--color-neel)] tracking-tight">
            Welcome back
          </h1>
          <p className="mt-1.5 text-xs sm:text-sm text-[var(--color-neel-muted)] leading-relaxed">
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
              className="absolute right-3 top-8 text-[var(--color-neel-muted)] hover:text-[var(--color-neel)] p-1 min-h-[36px] min-w-[36px] flex items-center justify-center transition-colors"
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

        <div className="mt-6 pt-5 border-t border-[var(--color-border)] text-center text-xs text-[var(--color-neel-muted)]">
          Don&apos;t have an account?{' '}
          <Link
            href="/signup"
            className="font-semibold text-[var(--color-neel)] underline hover:opacity-80"
          >
            Sign up
          </Link>
        </div>
      </div>

      <div className="mt-4 text-center">
        <p className="inline-flex items-center gap-1.5 text-[11px] text-[var(--color-neel-muted)]">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-patta)]" />
          Row-level security · Zero advertising · Encrypted data
        </p>
      </div>
    </div>
  );
}

export function LoginScreen() {
  return (
    <Suspense fallback={<div className="text-center text-xs text-[var(--color-neel-muted)]">Loading form...</div>}>
      <LoginForm />
    </Suspense>
  );
}
