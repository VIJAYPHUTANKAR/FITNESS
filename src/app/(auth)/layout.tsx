import Link from 'next/link';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-steel)] text-[var(--color-neel)]">
      {/* Branding bar */}
      <header className="w-full py-4 flex justify-center border-b border-[var(--color-border)] bg-[var(--color-plate)]">
        <Link
          href="/"
          className="flex items-center gap-2"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-neel)] text-[var(--color-haldi)] font-heading font-bold text-sm">
            FC
          </div>
          <span className="font-heading text-xl font-bold tracking-tight text-[var(--color-neel)]">
            FitCalc
          </span>
        </Link>
      </header>

      {/* Page content */}
      <main className="flex-1 flex items-center justify-center px-4 py-8 sm:py-12">
        {children}
      </main>

      <footer className="py-4 text-center text-xs text-[var(--color-neel-muted)]">
        Estimated values only · Not medical advice.
      </footer>
    </div>
  );
}
