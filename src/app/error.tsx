'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertCircle, RotateCcw, Home } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
  }) {
  useEffect(() => {
    // Log sanitized error message without exposing full stack to browser UI
    console.error('Application runtime error:', error.message);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-steel text-center">
      <div className="w-16 h-16 rounded-2xl bg-chukandar-50 border border-chukandar-200 flex items-center justify-center text-chukandar-600 mb-6 shadow-xs">
        <AlertCircle className="h-8 w-8" />
      </div>

      <h1 className="text-3xl font-heading font-bold text-ink tracking-tight">Something went wrong</h1>
      <p className="text-ink/60 mt-2 max-w-md text-sm leading-relaxed">
        An unexpected error occurred while processing your request. Please try again or return to the dashboard.
      </p>

      <div className="flex items-center gap-3 mt-8">
        <Button onClick={() => reset()} variant="primary" size="md">
          <RotateCcw className="h-4 w-4 mr-1.5" /> Try Again
        </Button>
        <Link href="/dashboard">
          <Button variant="secondary" size="md">
            <Home className="h-4 w-4 mr-1.5" /> Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}
