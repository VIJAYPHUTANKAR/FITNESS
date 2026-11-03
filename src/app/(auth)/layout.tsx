import Link from 'next/link';
import { ThemeToggle } from '@/components/layout';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-steel)] text-[var(--color-neel)] transition-colors">
      {/* Branding Navigation Bar */}
      <header className="w-full border-b border-[var(--color-border)] bg-[var(--color-plate)] transition-colors">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2.5 transition-opacity hover:opacity-85"
            aria-label="FitCalc Home"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-neel)] text-[var(--color-haldi)] font-heading font-bold text-sm shadow-xs">
              FC
            </div>
            <span className="font-heading text-xl font-bold tracking-tight text-[var(--color-neel)]">
              FitCalc
            </span>
          </Link>

          <div className="flex items-center gap-2">
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Centered Page Content */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        {children}
      </main>

      {/* Clean Global Footer */}
      <footer className="py-4 px-4 text-center text-xs text-[var(--color-neel-muted)] border-t border-[var(--color-border)]/50">
        Estimated values only · Not medical advice · FitCalc
      </footer>
    </div>
  );
}
