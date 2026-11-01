import { test, expect } from '@playwright/test';
import { USER_C, setupConsoleAndNetworkGuards, loginUser, completeOnboardingIfPresent } from './helpers';

test.describe('Account Deletion Flow (Test 17)', () => {
  test('17. User C logs food, deletes account via delete_my_account RPC, and cannot log back in', async ({ page }) => {
    test.skip(
      !USER_C.email || !USER_C.password,
      'Skipping: Disposable account E2E_USER_C credentials not provided in .env.e2e'
    );

    const verifyGuards = setupConsoleAndNetworkGuards(page);

    // 1. Sign in as User C
    await loginUser(page, USER_C);
    await completeOnboardingIfPresent(page);

    // 2. Go to Profile and initiate deletion
    await page.goto('/profile');
    await page.waitForLoadState('networkidle');

    // Click "Delete Account" button
    const deleteBtn = page.locator('button:has-text("Delete Account")');
    await expect(deleteBtn).toBeVisible({ timeout: 10000 });
    await deleteBtn.click();

    // Fill "DELETE" into the confirmation modal input
    const modalInput = page.locator('input[placeholder*="Type DELETE"]');
    await expect(modalInput).toBeVisible({ timeout: 5000 });
    await modalInput.fill('DELETE');

    // Confirm deletion
    const confirmBtn = page.locator('button:has-text("Confirm Delete")');
    await confirmBtn.click();

    // Verify redirected to landing page
    await expect(page).toHaveURL(/\/(?:#.*)?$/, { timeout: 15000 });

    // 3. Attempting to log back in as User C must FAIL
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    await page.fill('input[type="email"]', USER_C.email!);
    await page.fill('input[type="password"]', USER_C.password!);
    await page.click('button[type="submit"]');

    // Assert error message displayed and URL remains on /login
    await expect(page.locator('text=Invalid login credentials').or(page.locator('text=error'))).toBeVisible({ timeout: 10000 });
    expect(page.url()).toContain('/login');

    verifyGuards();
  });
});
