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
 *
 * Rules:
 * - Must resolve against a fixed dummy origin ('http://localhost') and match that origin.
 * - Rejects any backslash, control character (code < 0x20 or 0x7f), or encoded slash/backslash (%2f, %5c).
 * - Returns path + search + hash only.
 */
export function getSafeRedirectUrl(
  target: string | null | undefined,
  fallback = '/dashboard'
): string {
  if (!target) return fallback;
  const candidate = target.trim();
  if (!candidate || !candidate.startsWith('/')) {
    return fallback;
  }

  // Reject raw backslash
  if (candidate.includes('\\')) {
    return fallback;
  }

  // Reject raw control characters (< 0x20 or 0x7f)
  if (/[\x00-\x1f\x7f]/.test(candidate)) {
    return fallback;
  }

  // Reject encoded slash or backslash (%2f, %5c, case-insensitive)
  if (/%2f|%5c/i.test(candidate)) {
    return fallback;
  }

  // Reject encoded control characters (%00-%1f, %7f, case-insensitive)
  if (/%(?:0[0-9a-f]|1[0-9a-f]|7f)/i.test(candidate)) {
    return fallback;
  }

  try {
    const decoded = decodeURIComponent(candidate);
    if (decoded.includes('\\') || /[\x00-\x1f\x7f]/.test(decoded)) {
      return fallback;
    }
  } catch {
    return fallback;
  }

  try {
    const dummyOrigin = 'http://localhost';
    const resolved = new URL(candidate, dummyOrigin);

    if (resolved.origin !== dummyOrigin) {
      return fallback;
    }

    const pathAndQuery = resolved.pathname + resolved.search + resolved.hash;
    return pathAndQuery.startsWith('/') ? pathAndQuery : fallback;
  } catch {
    return fallback;
  }
}
