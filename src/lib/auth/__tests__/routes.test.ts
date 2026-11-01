// src/lib/auth/__tests__/routes.test.ts
import { isProtectedPath, isAuthPath, getSafeRedirectUrl } from '../routes';

describe('isProtectedPath (Task 6 Route Auth Guard)', () => {
  // Routes that MUST be protected
  test('protects core app routes and direct subpaths', () => {
    expect(isProtectedPath('/dashboard')).toBe(true);
    expect(isProtectedPath('/dashboard/x')).toBe(true);
    expect(isProtectedPath('/log')).toBe(true);
    expect(isProtectedPath('/log/food')).toBe(true);
    expect(isProtectedPath('/log/exercise')).toBe(true);
    expect(isProtectedPath('/burn-calculator')).toBe(true);
    expect(isProtectedPath('/history')).toBe(true);
    expect(isProtectedPath('/profile')).toBe(true);
    expect(isProtectedPath('/foods/custom')).toBe(true);
    expect(isProtectedPath('/onboarding')).toBe(true);
  });

  // Critical regression test: routes that MUST NOT be protected
  test('asserts /login and /signup are NOT protected, preventing redirect loops', () => {
    expect(isProtectedPath('/login')).toBe(false);
    expect(isProtectedPath('/signup')).toBe(false);
  });

  // Additional public / unrelated routes
  test('asserts landing, api, and prefix-sharing paths are NOT protected', () => {
    expect(isProtectedPath('/')).toBe(false);
    expect(isProtectedPath('/logout')).toBe(false);
    expect(isProtectedPath('/logs-anything')).toBe(false); // /logs-anything shares /log prefix but is not a subpath
    expect(isProtectedPath('/api/foods/search')).toBe(false); // API handles its own 401 JSON auth
  });

  test('asserts /log/food is protected specifically', () => {
    expect(isProtectedPath('/log/food')).toBe(true);
  });
});

describe('isAuthPath', () => {
  test('identifies /login and /signup as auth routes', () => {
    expect(isAuthPath('/login')).toBe(true);
    expect(isAuthPath('/signup')).toBe(true);
    expect(isAuthPath('/dashboard')).toBe(false);
    expect(isAuthPath('/')).toBe(false);
  });
});

describe('getSafeRedirectUrl (Open Redirect Prevention)', () => {
  test('allows safe relative paths', () => {
    expect(getSafeRedirectUrl('/dashboard')).toBe('/dashboard');
    expect(getSafeRedirectUrl('/log/food')).toBe('/log/food');
    expect(getSafeRedirectUrl('/burn-calculator?surplus=500')).toBe('/burn-calculator?surplus=500');
  });

  test('rejects protocol-relative URLs (//evil.com)', () => {
    expect(getSafeRedirectUrl('//evil.com')).toBe('/dashboard');
    expect(getSafeRedirectUrl('//evil.com/phish')).toBe('/dashboard');
  });

  test('rejects absolute URLs with protocol (https://evil.com)', () => {
    expect(getSafeRedirectUrl('https://evil.com')).toBe('/dashboard');
    expect(getSafeRedirectUrl('http://attacker.com/login')).toBe('/dashboard');
    expect(getSafeRedirectUrl('javascript:alert(1)')).toBe('/dashboard');
  });

  test('returns fallback for null, undefined, or empty targets', () => {
    expect(getSafeRedirectUrl(null)).toBe('/dashboard');
    expect(getSafeRedirectUrl(undefined)).toBe('/dashboard');
    expect(getSafeRedirectUrl('')).toBe('/dashboard');
    expect(getSafeRedirectUrl(null, '/profile')).toBe('/profile');
  });
});
