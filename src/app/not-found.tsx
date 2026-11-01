import Link from 'next/link';
import { Dumbbell, Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50 text-center">
      <div className="w-16 h-16 rounded-3xl bg-emerald-100 flex items-center justify-center text-emerald-600 mb-6 shadow-sm">
        <Dumbbell className="h-8 w-8" />
      </div>

      <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">404 - Page Not Found</h1>
      <p className="text-gray-500 mt-2 max-w-md text-sm leading-relaxed">
        The page you are looking for doesn&apos;t exist, has been moved, or is temporarily unavailable.
      </p>

      <div className="flex items-center gap-3 mt-8">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition-all shadow-sm active:scale-95"
        >
          <Home className="h-4 w-4" /> Go to Dashboard
        </Link>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 font-semibold text-sm transition-all shadow-sm active:scale-95"
        >
          <ArrowLeft className="h-4 w-4" /> Home
        </Link>
      </div>
    </div>
  );
}
