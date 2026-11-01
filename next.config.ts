import type { NextConfig } from "next";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
let supabaseHost = '';
try {
  if (supabaseUrl) {
    supabaseHost = new URL(supabaseUrl).origin;
  }
} catch {
  supabaseHost = '';
}

const isDev = process.env.NODE_ENV !== 'production';

const cspDirectives = [
  "default-src 'self'",
  `connect-src 'self' ${supabaseHost} https://*.supabase.co https://world.openfoodfacts.org`.trim(),
  "img-src 'self' data: https://world.openfoodfacts.org",
  "style-src 'self' 'unsafe-inline'",
  isDev ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'" : "script-src 'self' 'unsafe-inline'",
  "font-src 'self' data:",
  "frame-ancestors 'none'",
];

const cspHeader = cspDirectives.join('; ');

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'world.openfoodfacts.org' },
    ],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-XSS-Protection', value: '0' },
          { key: 'Content-Security-Policy-Report-Only', value: cspHeader },
        ],
      },
    ];
  },
};

export default nextConfig;
