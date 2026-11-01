import { Page, expect } from '@playwright/test';

export interface TestUser {
  email?: string;
  password?: string;
}

export const USER_A: TestUser = {
  email: process.env.E2E_USER_A_EMAIL,
  password: process.env.E2E_USER_A_PASSWORD,
};

export const USER_B: TestUser = {
  email: process.env.E2E_USER_B_EMAIL,
  password: process.env.E2E_USER_B_PASSWORD,
};

export const USER_C: TestUser = {
  email: process.env.E2E_USER_C_EMAIL,
  password: process.env.E2E_USER_C_PASSWORD,
};

/**
 * Attaches listeners to fail the test if any unexpected console errors
 * or failed network requests occur (ignoring expected 401s).
 */
export function setupConsoleAndNetworkGuards(page: Page) {
  const consoleErrors: string[] = [];
  const networkFailures: string[] = [];

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      const text = msg.text();
      // Ignore favicon and expected 401 log noise
      if (!text.includes('favicon.ico') && !text.includes('401')) {
        consoleErrors.push(text);
      }
    }
  });

  page.on('response', (res) => {
    const status = res.status();
    const url = res.url();
    // Allow 401 on intentionally unauthenticated endpoints
    if (status >= 400 && status !== 401 && !url.includes('favicon.ico')) {
      networkFailures.push(`[${status}] ${url}`);
    }
  });

  return () => {
    expect(consoleErrors, `Browser console errors detected: ${consoleErrors.join('; ')}`).toEqual([]);
    expect(networkFailures, `Network failure responses detected: ${networkFailures.join('; ')}`).toEqual([]);
  };
}

/**
 * Performs login using user credentials.
 */
export async function loginUser(page: Page, user: TestUser) {
  if (!user.email || !user.password) {
    throw new Error('User credentials are missing.');
  }

  await page.goto('/login');
  await page.waitForLoadState('networkidle');

  await page.fill('input[type="email"]', user.email);
  await page.fill('input[type="password"]', user.password);
  await page.click('button[type="submit"]');

  // Should navigate away from /login
  await expect(page).not.toHaveURL(/\/login/, { timeout: 15000 });
}

/**
 * Completes onboarding if redirected to /onboarding
 */
export async function completeOnboardingIfPresent(page: Page) {
  if (page.url().includes('/onboarding')) {
    // Step 1: Personal Details
    const nameInput = page.locator('input[type="text"]');
    if (await nameInput.isVisible()) {
      await nameInput.fill('E2E Tester');
    }

    const nextBtn1 = page.locator('button:has-text("Next")');
    if (await nextBtn1.isVisible()) {
      await nextBtn1.click();
    }

    // Step 2: Body Metrics
    await page.waitForTimeout(500);
    const nextBtn2 = page.locator('button:has-text("Calculate")');
    if (await nextBtn2.isVisible()) {
      await nextBtn2.click();
    }

    // Step 3: Calorie Target
    await page.waitForTimeout(500);
    const saveBtn = page.locator('button:has-text("Finish")');
    if (await saveBtn.isVisible()) {
      await saveBtn.click();
    }

    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });
  }
}
