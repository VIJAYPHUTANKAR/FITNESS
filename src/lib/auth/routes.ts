// src/lib/auth/routes.ts
// Pure helper functions for auth route gating and open-redirect prevention.

export const PROTECTED_PATHS = [
  '/dashboard',
  '/log',
  '/burn-calculator',
  '/history',
  '/profile',
  '/foods',
  '/onboarding',
];

export const AUTH_PATHS = ['/login', '/signup'];

/**
 * Determines whether a pathname requires an authenticated user session.
 * Exact matches or direct subpaths (e.g. /log, /log/food, /dashboard/x) are protected.
 * Unrelated paths sharing a common prefix (e.g. /login vs /log, /logs-anything) are NOT protected.
 */
export function isProtectedPath(pathname: string): boolean {
  if (!pathname) return false;
  return PROTECTED_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );
}

/**
 * Determines whether a pathname is an auth gateway page (login, signup).
 */
export function isAuthPath(pathname: string): boolean {
  if (!pathname) return false;
  return AUTH_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

/**
 * Validates and sanitizes return/redirect URLs against open redirect vulnerabilities.
 * Strictly permits relative paths starting with a single '/' and rejects '//', protocols, and external domains.
 */
export function getSafeRedirectUrl(
  target: string | null | undefined,
  fallback = '/dashboard'
): string {
  if (!target) return fallback;
  const trimmed = target.trim();
  // Must start with single '/', but not '//' (protocol-relative URL)
  if (trimmed.startsWith('/') && !trimmed.startsWith('//')) {
    return trimmed;
  }
  return fallback;
}
