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
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50 text-center">
      <div className="w-16 h-16 rounded-3xl bg-red-100 flex items-center justify-center text-red-600 mb-6 shadow-sm">
        <AlertCircle className="h-8 w-8" />
      </div>

      <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Something went wrong</h1>
      <p className="text-gray-500 mt-2 max-w-md text-sm leading-relaxed">
        An unexpected error occurred while processing your request. Please try again or return to the dashboard.
      </p>

      <div className="flex items-center gap-3 mt-8">
        <Button onClick={() => reset()} className="gap-2">
          <RotateCcw className="h-4 w-4" /> Try Again
        </Button>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 font-semibold text-sm transition-all shadow-sm"
        >
          <Home className="h-4 w-4" /> Dashboard
        </Link>
      </div>
    </div>
  );
}
