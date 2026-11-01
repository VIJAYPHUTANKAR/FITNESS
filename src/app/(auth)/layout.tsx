import Link from 'next/link';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Branding bar */}
      <header className="w-full py-5 flex justify-center border-b border-gray-100 bg-white shadow-sm">
        <Link
          href="/"
          className="text-2xl font-extrabold tracking-tight text-emerald-700 hover:text-emerald-600 transition-colors"
        >
          Fit<span className="text-gray-800">Calc</span>
        </Link>
      </header>

      {/* Page content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        {children}
      </main>

      <footer className="py-4 text-center text-xs text-gray-400">
        Estimated values only. Not medical advice.
      </footer>
    </div>
  );
}
