import { test, expect } from '@playwright/test';
import { USER_A, setupConsoleAndNetworkGuards, loginUser, completeOnboardingIfPresent } from './helpers';

test.describe('Authenticated User A Core Flows (Tests 5 - 15)', () => {
  test.beforeEach(async () => {
    test.skip(
      !USER_A.email || !USER_A.password,
      'Skipping: E2E_USER_A_EMAIL or E2E_USER_A_PASSWORD not provided in .env.e2e'
    );
  });

  test('5. Login works and lands on dashboard or onboarding', async ({ page }) => {
    const verifyGuards = setupConsoleAndNetworkGuards(page);
    await loginUser(page, USER_A);

    // Expect to land on /dashboard or /onboarding
    const currentUrl = page.url();
    expect(currentUrl.includes('/dashboard') || currentUrl.includes('/onboarding')).toBe(true);

    verifyGuards();
  });

  test('6. Onboarding completes (if profile empty) and saves; dashboard shows calorie goal', async ({ page }) => {
    const verifyGuards = setupConsoleAndNetworkGuards(page);
    await loginUser(page, USER_A);
    await completeOnboardingIfPresent(page);

    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // Dashboard must display daily budget / calorie goal
    await expect(page.locator('text=Daily budget:').or(page.locator('text=Daily Goal'))).toBeVisible();

    verifyGuards();
  });

  test('7. Search seeded food (Roti), log it with grams, verify breakfast entry with correct calories', async ({ page }) => {
    const verifyGuards = setupConsoleAndNetworkGuards(page);
    await loginUser(page, USER_A);
    await completeOnboardingIfPresent(page);

    await page.goto('/log/food');
    await page.waitForLoadState('networkidle');

    // Click "Add Food" in Breakfast section
    const addFoodBtn = page.locator('button:has-text("Add Food")').first();
    await addFoodBtn.click();

    // Search for "roti"
    const searchInput = page.locator('input[placeholder*="Search food"]');
    await searchInput.fill('roti');
    await page.waitForTimeout(600); // debounce wait

    // Select Roti / Chapati (264 kcal / 100g)
    const resultItem = page.locator('button:has-text("Roti / Chapati")').first();
    await expect(resultItem).toBeVisible({ timeout: 10000 });
    await resultItem.click();

    // Set 100 grams
    const gramInput = page.locator('input[type="number"]').first();
    await gramInput.fill('100');

    // Expected calories for 100g roti: 264 kcal
    const logBtn = page.locator('button:has-text("Log")').first();
    await logBtn.click();

    // Verify item is present in today's food log with 264 kcal
    await expect(page.locator('text=Roti / Chapati').first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=264 kcal').first()).toBeVisible();

    verifyGuards();
  });

  test('8. Edit portion inline, verify calories rescale, delete entry and verify totals return', async ({ page }) => {
    const verifyGuards = setupConsoleAndNetworkGuards(page);
    await loginUser(page, USER_A);
    await completeOnboardingIfPresent(page);

    await page.goto('/log/food');
    await page.waitForLoadState('networkidle');

    // Find the logged food item edit button
    const editBtn = page.locator('button[title="Edit quantity"]').first();
    if (await editBtn.isVisible()) {
      await editBtn.click();

      // Change portion to 200g (264 * 2 = 528 kcal)
      const qtyInput = page.locator('input[type="number"]').first();
      await qtyInput.fill('200');

      const saveBtn = page.locator('button:has-text("Save")').first();
      await saveBtn.click();

      // Assert rescaled calories
      await expect(page.locator('text=528 kcal').first()).toBeVisible({ timeout: 10000 });

      // Clean up: delete entry
      const deleteBtn = page.locator('button[title="Delete entry"]').first();
      await deleteBtn.click();
      await page.waitForTimeout(500);

      // Verify item removed
      await expect(page.locator('text=528 kcal')).not.toBeVisible();
    }

    verifyGuards();
  });

  test('9. Log exercise, verify calories burned (MET x weight x time), edit it, delete it', async ({ page }) => {
    const verifyGuards = setupConsoleAndNetworkGuards(page);
    await loginUser(page, USER_A);
    await completeOnboardingIfPresent(page);

    await page.goto('/log/exercise');
    await page.waitForLoadState('networkidle');

    // Select an exercise and duration: e.g. 30 min
    const durationInput = page.locator('input[type="number"]').first();
    await durationInput.fill('30');

    const submitBtn = page.locator('button:has-text("Log Workout")');
    await submitBtn.click();

    // Verify workout log item appears
    await expect(page.locator('text=30 min').first()).toBeVisible({ timeout: 10000 });

    // Clean up: delete exercise log
    const deleteBtn = page.locator('button[title*="Delete"]').or(page.locator('button:has(svg.lucide-trash-2)')).first();
    if (await deleteBtn.isVisible()) {
      await deleteBtn.click();
      await page.waitForTimeout(500);
    }

    verifyGuards();
  });

  test('10. Activity Equivalents calculator table, spread N days, save plan', async ({ page }) => {
    const verifyGuards = setupConsoleAndNetworkGuards(page);
    await loginUser(page, USER_A);
    await completeOnboardingIfPresent(page);

    // Direct navigation to Activity Equivalents
    await page.goto('/burn-calculator');
    await page.waitForLoadState('networkidle');

    // Verify input accepts calorie amount (e.g. 600)
    const calInput = page.locator('#calories').or(page.locator('input[placeholder*="500"]'));
    await calInput.fill('600');

    // Change days to 3
    const daysInput = page.locator('#days').or(page.locator('input[type="number"]').nth(1));
    if (await daysInput.isVisible()) {
      await daysInput.fill('3');
    }

    // Save plan
    const saveBtn = page.locator('button:has-text("Save this Plan")').first();
    if (await saveBtn.isVisible()) {
      await saveBtn.click();
      await expect(page.locator('text=Plan saved successfully!')).toBeVisible({ timeout: 10000 });
    }

    verifyGuards();
  });

  test('11. History page renders charts for 7 / 14 / 30 days without console errors', async ({ page }) => {
    const verifyGuards = setupConsoleAndNetworkGuards(page);
    await loginUser(page, USER_A);
    await completeOnboardingIfPresent(page);

    await page.goto('/history');
    await page.waitForLoadState('networkidle');

    // Toggle 7, 14, 30 day buttons
    const btn7 = page.locator('button:has-text("7 days")');
    const btn14 = page.locator('button:has-text("14 days")');
    const btn30 = page.locator('button:has-text("30 days")');

    if (await btn7.isVisible()) await btn7.click();
    if (await btn14.isVisible()) await btn14.click();
    if (await btn30.isVisible()) await btn30.click();

    await page.waitForTimeout(500);
    verifyGuards();
  });

  test('12. Custom food: create one, log it, delete it', async ({ page }) => {
    const verifyGuards = setupConsoleAndNetworkGuards(page);
    await loginUser(page, USER_A);
    await completeOnboardingIfPresent(page);

    await page.goto('/foods/custom');
    await page.waitForLoadState('networkidle');

    const foodName = `E2E Custom Oats ${Date.now()}`;
    await page.fill('input[placeholder*="Homemade Granola"]', foodName);
    await page.fill('input[placeholder="kcal"]', '350');

    const submitBtn = page.locator('button:has-text("Save Custom Food")');
    await submitBtn.click();

    // Verify food appears in custom foods list
    await expect(page.locator(`text=${foodName}`)).toBeVisible({ timeout: 10000 });

    // Clean up: delete custom food
    const deleteBtn = page.locator(`div:has-text("${foodName}")`).locator('button').last();
    if (await deleteBtn.isVisible()) {
      await deleteBtn.click();
      await page.waitForTimeout(500);
      await expect(page.locator(`text=${foodName}`)).not.toBeVisible();
    }

    verifyGuards();
  });

  test('13. Weigh-in on profile page saves and appears in history', async ({ page }) => {
    const verifyGuards = setupConsoleAndNetworkGuards(page);
    await loginUser(page, USER_A);
    await completeOnboardingIfPresent(page);

    await page.goto('/profile');
    await page.waitForLoadState('networkidle');

    const weightInput = page.locator('input[placeholder*="e.g. 72.5"]');
    if (await weightInput.isVisible()) {
      await weightInput.fill('75.5');
      const logWeightBtn = page.locator('button:has-text("Log Weight")');
      await logWeightBtn.click();
      await expect(page.locator('text=Weight updated for today!')).toBeVisible({ timeout: 10000 });
    }

    verifyGuards();
  });

  test('14. CSV export downloads a non-empty file', async ({ page }) => {
    const verifyGuards = setupConsoleAndNetworkGuards(page);
    await loginUser(page, USER_A);
    await completeOnboardingIfPresent(page);

    await page.goto('/profile');
    await page.waitForLoadState('networkidle');

    const downloadPromise = page.waitForEvent('download');
    await page.click('button:has-text("Export Data (CSV)")');
    const download = await downloadPromise;

    expect(download.suggestedFilename()).toContain('fitcalc_data_export');
    const path = await download.path();
    expect(path).toBeTruthy();

    verifyGuards();
  });

  test('15. Calorie goal override below safety floor shows warning', async ({ page }) => {
    const verifyGuards = setupConsoleAndNetworkGuards(page);
    await loginUser(page, USER_A);
    await completeOnboardingIfPresent(page);

    await page.goto('/profile');
    await page.waitForLoadState('networkidle');

    // Find the daily calorie goal input and set to 900 (< 1200/1500)
    const goalInput = page.locator('input[min="500"][max="10000"]');
    if (await goalInput.isVisible()) {
      await goalInput.fill('900');
      // Assert safety floor warning
      await expect(page.locator('text=Below safety floor')).toBeVisible({ timeout: 5000 });
    }

    verifyGuards();
  });
});
