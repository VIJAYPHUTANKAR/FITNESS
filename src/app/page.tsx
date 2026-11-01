import Link from 'next/link';

const features = [
  {
    icon: '🥗',
    title: 'Food Logging',
    description:
      'Search thousands of foods and log meals instantly. Track macros, calories, and nutrients with every bite.',
  },
  {
    icon: '🔥',
    title: 'Burn Calculator',
    description:
      'See exactly how many calories your workouts burn based on your body weight, activity type, and duration.',
  },
  {
    icon: '📈',
    title: 'Progress Tracking',
    description:
      'Visualise your daily intake vs. burn, monitor trends over time, and hit your fitness goals faster.',
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* ── Hero ── */}
      <section className="relative flex flex-col items-center justify-center text-center px-6 py-32 bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-700 overflow-hidden">
        {/* decorative blobs */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-emerald-600/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto space-y-6">
          <span className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold tracking-widest uppercase bg-emerald-700/60 text-emerald-200 border border-emerald-600">
            Free · No credit card required
          </span>

          <h1 className="text-6xl sm:text-7xl font-extrabold text-white drop-shadow-md leading-tight">
            Fit<span className="text-emerald-300">Calc</span>
          </h1>

          <p className="text-xl sm:text-2xl text-emerald-100 max-w-xl mx-auto leading-relaxed">
            Track what you eat.&nbsp;
            <span className="text-white font-semibold">See what to burn.</span>
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
            <Link
              href="/signup"
              className="px-8 py-3.5 rounded-xl font-semibold text-lg bg-white text-emerald-800 hover:bg-emerald-50 transition-colors shadow-lg"
            >
              Get Started (Free)
            </Link>
            <Link
              href="/login"
              className="px-8 py-3.5 rounded-xl font-semibold text-lg border-2 border-white/60 text-white hover:bg-white/10 transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="flex-1 bg-gray-50 py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-gray-800 mb-4">
            Everything you need to reach your goals
          </h2>
          <p className="text-center text-gray-500 mb-14 text-lg max-w-2xl mx-auto">
            Simple, science-backed tools to keep your nutrition and activity in
            perfect balance.
          </p>

          <div className="grid sm:grid-cols-3 gap-8">
            {features.map((f) => (
              <div
                key={f.title}
                className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col items-start gap-4"
              >
                <span className="text-4xl">{f.icon}</span>
                <h3 className="text-xl font-bold text-gray-800">{f.title}</h3>
                <p className="text-gray-500 leading-relaxed text-sm">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer / Disclaimer ── */}
      <footer className="bg-gray-100 border-t border-gray-200 py-6 px-6 text-center">
        <p className="text-xs text-gray-400">
          Estimated values only. Not medical advice. Consult a qualified healthcare
          professional before making dietary or exercise changes.
        </p>
        <p className="text-xs text-gray-400 mt-1">
          © {new Date().getFullYear()} FitCalc. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
