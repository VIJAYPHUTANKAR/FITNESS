import Link from 'next/link';
import { InteractivePlateDemo } from '@/features/landing';
import { ThemeToggle } from '@/components/layout';

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-steel)] text-[var(--color-neel)]">
      {/* ── Top Header ─────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-plate)] px-4 sm:px-8">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-neel)] text-[var(--color-haldi)] font-heading font-bold text-sm">
            FC
          </div>
          <span className="font-heading text-xl font-bold tracking-tight text-[var(--color-neel)]">
            FitCalc
          </span>
        </Link>

        <div className="flex items-center gap-3 sm:gap-4">
          <ThemeToggle />
          <Link
            href="/login"
            className="px-4 py-2 text-xs sm:text-sm font-semibold text-[var(--color-neel)] hover:bg-[var(--color-steel)] rounded-[10px] transition-colors min-h-[44px] flex items-center"
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className="px-4 sm:px-5 py-2 text-xs sm:text-sm font-semibold bg-[var(--color-neel)] text-[var(--color-plate)] dark:text-[#12142B] hover:opacity-90 rounded-[12px] transition-all min-h-[44px] flex items-center shadow-xs"
          >
            Get started
          </Link>
        </div>
      </header>

      {/* ── Hero Section with Interactive Plate Demo ───────────── */}
      <main className="flex-1">
        <section className="py-12 sm:py-20 px-4 sm:px-6 max-w-5xl mx-auto text-center space-y-8">
          <div className="space-y-3 max-w-2xl mx-auto">
            <h1 className="font-heading text-3xl sm:text-5xl font-extrabold tracking-tight text-[var(--color-neel)] leading-tight">
              Nutrition tracking built for Indian meals
            </h1>
            <p className="text-sm sm:text-base text-[var(--color-neel-muted)] leading-relaxed">
              Log roti, dal, sabzi, and regional favorites without guessing Western substitutes. Understand your daily energy on a traditional Thali plate.
            </p>
          </div>

          {/* Interactive Demo Component */}
          <InteractivePlateDemo />

          {/* Hero CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/signup"
              className="w-full sm:w-auto px-8 py-3.5 rounded-[12px] font-semibold text-sm bg-[var(--color-neel)] text-[var(--color-plate)] dark:text-[#12142B] hover:opacity-90 transition-all shadow-xs min-h-[48px] flex items-center justify-center"
            >
              Start tracking for free
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto px-6 py-3.5 rounded-[12px] font-semibold text-sm bg-[var(--color-plate)] text-[var(--color-neel)] border border-[var(--color-border)] hover:bg-[var(--color-steel)] transition-colors min-h-[48px] flex items-center justify-center"
            >
              Sign in to your account
            </Link>
          </div>
        </section>

        {/* ── Three Editorial Features ───────────────────────────── */}
        <section className="py-16 sm:py-24 px-4 sm:px-6 bg-[var(--color-plate)] border-t border-[var(--color-border)]">
          <div className="max-w-5xl mx-auto space-y-12">
            <div className="text-center space-y-2 max-w-xl mx-auto">
              <h2 className="font-heading text-2xl sm:text-3xl font-bold text-[var(--color-neel)]">
                Three tools. Zero anxiety.
              </h2>
              <p className="text-xs sm:text-sm text-[var(--color-neel-muted)]">
                Honest numbers and calm feedback without alarm bells or restriction guilt.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="rounded-[16px] border border-[var(--color-border)] bg-[var(--color-steel)] p-6 space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="h-12 w-12 rounded-[12px] bg-[var(--color-plate)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-chukandar)]">
                    <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none">
                      <circle cx="12" cy="12" r="9" />
                      <path d="M12 7v5l3 3" />
                    </svg>
                  </div>
                  <h3 className="font-heading text-lg font-bold text-[var(--color-neel)]">
                    Everyday Indian food
                  </h3>
                  <p className="text-xs text-[var(--color-neel-muted)] leading-relaxed">
                    Search pre-calibrated regional items with accurate gram portions. Keep track of protein, carbohydrates, and fats in real-world meal sizes.
                  </p>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="rounded-[16px] border border-[var(--color-border)] bg-[var(--color-steel)] p-6 space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="h-12 w-12 rounded-[12px] bg-[var(--color-plate)] border border-[var(--color-border)] flex items-center justify-center text-[#7A4B00] dark:text-[#F7C966]">
                    <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none">
                      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                    </svg>
                  </div>
                  <h3 className="font-heading text-lg font-bold text-[var(--color-neel)]">
                    Activity equivalents
                  </h3>
                  <p className="text-xs text-[var(--color-neel-muted)] leading-relaxed">
                    See realistic time estimates for walking, cycling, or badminton to expend energy, with multi-day pacing options to avoid fatigue.
                  </p>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="rounded-[16px] border border-[var(--color-border)] bg-[var(--color-steel)] p-6 space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="h-12 w-12 rounded-[12px] bg-[var(--color-plate)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-patta)]">
                    <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none">
                      <path d="M3 3v18h18" />
                      <path d="m19 9-5 5-4-4-3 3" />
                    </svg>
                  </div>
                  <h3 className="font-heading text-lg font-bold text-[var(--color-neel)]">
                    Calm progress trends
                  </h3>
                  <p className="text-xs text-[var(--color-neel-muted)] leading-relaxed">
                    Review your rolling 7, 14, and 30-day nutrition history. Export your complete data whenever you wish, or delete your account with one click.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer / Health Disclaimer ─────────────────────────── */}
      <footer className="border-t border-[var(--color-border)] bg-[var(--color-plate)] py-8 px-4 sm:px-6 text-center space-y-2">
        <p className="text-xs text-[var(--color-neel-muted)] max-w-2xl mx-auto leading-relaxed">
          Estimated values only. Not medical advice. Consult a qualified healthcare professional before making dietary or exercise changes.
        </p>
        <p className="text-xs text-[var(--color-neel-muted)]">
          © {new Date().getFullYear()} FitCalc. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
