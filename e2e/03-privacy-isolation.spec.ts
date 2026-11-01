import { test, expect } from '@playwright/test';
import { USER_A, USER_B, setupConsoleAndNetworkGuards, loginUser, completeOnboardingIfPresent } from './helpers';

test.describe('Privacy Isolation Between Two Users (Test 16)', () => {
  test('16. User A custom food & data is completely hidden from User B', async ({ browser }) => {
    test.skip(
      !USER_A.email || !USER_A.password || !USER_B.email || !USER_B.password,
      'Skipping: Both E2E_USER_A and E2E_USER_B credentials required in .env.e2e'
    );

    const secretFoodName = `SecretUserAFood_${Date.now()}`;

    // Context 1: User A logs in and creates a custom food
    const contextA = await browser.newContext();
    const pageA = await contextA.newPage();
    const verifyGuardsA = setupConsoleAndNetworkGuards(pageA);

    await loginUser(pageA, USER_A);
    await completeOnboardingIfPresent(pageA);

    await pageA.goto('/foods/custom');
    await pageA.waitForLoadState('networkidle');

    await pageA.fill('input[placeholder*="Homemade Granola"]', secretFoodName);
    await pageA.fill('input[placeholder="kcal"]', '420');
    await pageA.click('button:has-text("Save Custom Food")');
    await expect(pageA.locator(`text=${secretFoodName}`)).toBeVisible({ timeout: 10000 });

    // Context 2: User B logs in in a separate isolated browser context
    const contextB = await browser.newContext();
    const pageB = await contextB.newPage();
    const verifyGuardsB = setupConsoleAndNetworkGuards(pageB);

    await loginUser(pageB, USER_B);
    await completeOnboardingIfPresent(pageB);

    // 1. User B goes to /foods/custom - secret food MUST NOT appear
    await pageB.goto('/foods/custom');
    await pageB.waitForLoadState('networkidle');
    await expect(pageB.locator(`text=${secretFoodName}`)).not.toBeVisible();

    // 2. User B searches for the secret food in /log/food - MUST NOT appear
    await pageB.goto('/log/food');
    await pageB.waitForLoadState('networkidle');
    const addBtn = pageB.locator('button:has-text("Add Food")').first();
    if (await addBtn.isVisible()) {
      await addBtn.click();
      const searchInput = pageB.locator('input[placeholder*="Search food"]');
      await searchInput.fill(secretFoodName);
      await pageB.waitForTimeout(600);
      await expect(pageB.locator(`text=${secretFoodName}`)).not.toBeVisible();
    }

    // 3. User B's dashboard totals must not include User A's data
    await pageB.goto('/dashboard');
    await pageB.waitForLoadState('networkidle');

    // Clean up in Context A: delete secret custom food
    await pageA.goto('/foods/custom');
    await pageA.waitForLoadState('networkidle');
    const deleteBtn = pageA.locator(`div:has-text("${secretFoodName}")`).locator('button').last();
    if (await deleteBtn.isVisible()) {
      await deleteBtn.click();
      await pageA.waitForTimeout(500);
    }

    verifyGuardsA();
    verifyGuardsB();

    await contextA.close();
    await contextB.close();
  });
});
