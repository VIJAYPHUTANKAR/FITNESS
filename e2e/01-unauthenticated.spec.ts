import { test, expect } from '@playwright/test';
import { setupConsoleAndNetworkGuards } from './helpers';

test.describe('Unauthenticated User Flows (Tests 1 - 4)', () => {
  test('1. Landing page loads with expected branding and navigation', async ({ page }) => {
    const verifyGuards = setupConsoleAndNetworkGuards(page);
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveTitle(/FitCalc/i);
    await expect(page.locator('h1, h2, span:has-text("FitCalc")').first()).toBeVisible();

    // Verify presence of login and signup links
    const loginLink = page.locator('a[href="/login"]').first();
    const signupLink = page.locator('a[href="/signup"]').first();
    await expect(loginLink).toBeVisible();
    await expect(signupLink).toBeVisible();

    verifyGuards();
  });

  test('2. /login and /signup load with no redirect loop, asserting final URL and visible form', async ({ page }) => {
    const verifyGuards = setupConsoleAndNetworkGuards(page);

    // Test /login
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    expect(page.url()).toContain('/login');
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]').first()).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();

    // Test /signup
    await page.goto('/signup');
    await page.waitForLoadState('networkidle');
    expect(page.url()).toContain('/signup');
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]').first()).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();

    verifyGuards();
  });

  test('3. Private routes redirect unauthenticated users to /login', async ({ page }) => {
    const verifyGuards = setupConsoleAndNetworkGuards(page);
    const protectedRoutes = [
      '/dashboard',
      '/log/food',
      '/log/exercise',
      '/burn-calculator',
      '/history',
      '/profile',
      '/foods/custom',
    ];

    for (const route of protectedRoutes) {
      await page.goto(route);
      await page.waitForLoadState('networkidle');

      // Assert redirected to /login with next parameter
      expect(page.url()).toContain('/login');
      await expect(page.locator('input[type="email"]')).toBeVisible();
    }

    verifyGuards();
  });

  test('4. GET /api/foods/search?q=rice returns 401 Unauthorized for unauthenticated callers', async ({ request }) => {
    const response = await request.get('/api/foods/search?q=rice');
    expect(response.status()).toBe(401);
    const body = await response.json();
    expect(body).toHaveProperty('error');
    expect(body.error).toContain('Unauthorized');
  });
});
