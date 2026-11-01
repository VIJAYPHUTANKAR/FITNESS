// src/lib/auth/__tests__/routes.test.ts
import { isProtectedPath, isAuthPath, getSafeRedirectUrl } from '../routes';

describe('isProtectedPath (Route Auth Guard)', () => {
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

  test('asserts /login and /signup are NOT protected, preventing redirect loops', () => {
    expect(isProtectedPath('/login')).toBe(false);
    expect(isProtectedPath('/signup')).toBe(false);
  });

  test('asserts landing, api, and prefix-sharing paths are NOT protected', () => {
    expect(isProtectedPath('/')).toBe(false);
    expect(isProtectedPath('/logout')).toBe(false);
    expect(isProtectedPath('/logs-anything')).toBe(false);
    expect(isProtectedPath('/api/foods/search')).toBe(false);
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

describe('getSafeRedirectUrl (Open Redirect Hardening)', () => {
  test('accepts safe relative paths and search params', () => {
    expect(getSafeRedirectUrl('/dashboard')).toBe('/dashboard');
    expect(getSafeRedirectUrl('/log/food?date=2026-11-01')).toBe('/log/food?date=2026-11-01');
    expect(getSafeRedirectUrl('/profile#danger')).toBe('/profile#danger');
  });

  test('rejects backslash injection: /\\evil.example', () => {
    expect(getSafeRedirectUrl('/\\evil.example')).toBe('/dashboard');
  });

  test('rejects encoded backslash injection: /%5c%5cevil.example', () => {
    expect(getSafeRedirectUrl('/%5c%5cevil.example')).toBe('/dashboard');
    expect(getSafeRedirectUrl('/%5Cevil.example')).toBe('/dashboard');
  });

  test('rejects protocol-relative URLs: //evil.example', () => {
    expect(getSafeRedirectUrl('//evil.example')).toBe('/dashboard');
    expect(getSafeRedirectUrl('//evil.example/path')).toBe('/dashboard');
  });

  test('rejects external scheme URLs without leading slash: https:evil.example', () => {
    expect(getSafeRedirectUrl('https:evil.example')).toBe('/dashboard');
    expect(getSafeRedirectUrl('https://evil.example')).toBe('/dashboard');
  });

  test('rejects javascript: URLs: javascript:alert(1)', () => {
    expect(getSafeRedirectUrl('javascript:alert(1)')).toBe('/dashboard');
  });

  test('rejects encoded control characters: /%09/evil.example', () => {
    expect(getSafeRedirectUrl('/%09/evil.example')).toBe('/dashboard');
    expect(getSafeRedirectUrl('/\x00/evil.example')).toBe('/dashboard');
    expect(getSafeRedirectUrl('/\x1f/evil.example')).toBe('/dashboard');
  });

  test('rejects encoded slashes (%2f / %2F)', () => {
    expect(getSafeRedirectUrl('/dashboard%2fevil')).toBe('/dashboard');
    expect(getSafeRedirectUrl('/%2F%2Fevil.com')).toBe('/dashboard');
  });

  test('returns fallback for null, undefined, or empty targets', () => {
    expect(getSafeRedirectUrl(null)).toBe('/dashboard');
    expect(getSafeRedirectUrl(undefined)).toBe('/dashboard');
    expect(getSafeRedirectUrl('')).toBe('/dashboard');
    expect(getSafeRedirectUrl(null, '/profile')).toBe('/profile');
  });
});
