import Link from 'next/link';
import { Home, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-steel text-center">
      <div className="w-16 h-16 rounded-2xl bg-steel-100 border border-steel-200 flex items-center justify-center text-haldi-600 mb-6 shadow-xs">
        <svg viewBox="0 0 32 32" className="w-8 h-8 fill-none stroke-current" strokeWidth="2">
          <circle cx="16" cy="16" r="13" />
          <path d="M12 16h8" strokeLinecap="round" />
        </svg>
      </div>

      <h1 className="text-3xl font-heading font-bold text-ink tracking-tight">404 - Page Not Found</h1>
      <p className="text-ink/60 mt-2 max-w-md text-sm leading-relaxed">
        The page you are looking for doesn&apos;t exist, has been moved, or is temporarily unavailable.
      </p>

      <div className="flex items-center gap-3 mt-8">
        <Link href="/dashboard">
          <Button variant="primary" size="md">
            <Home className="h-4 w-4 mr-1.5" /> Go to Dashboard
          </Button>
        </Link>
        <Link href="/">
          <Button variant="secondary" size="md">
            <ArrowLeft className="h-4 w-4 mr-1.5" /> Home
          </Button>
        </Link>
      </div>
    </div>
  );
}
