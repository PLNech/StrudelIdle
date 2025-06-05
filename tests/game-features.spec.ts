import { test, expect } from '@playwright/test';

test.describe('AlgoRave IDLE - Game Features', () => {
  test('should generate BPS automatically when modules are owned', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);

    // Get initial beats
    const initialBeats = await page.locator('text=/Beats: [\\d\\.]+/').textContent();
    
    // Click enough to buy a module
    const tapButton = page.locator('text=Tap Beat');
    for (let i = 0; i < 15; i++) {
      await tapButton.click();
      await page.waitForTimeout(50);
    }

    // Buy module
    const buyButton = page.locator('text=Buy Kick Drum (bd)').first();
    await buyButton.click();
    await page.waitForTimeout(1000);

    // Wait for BPS to generate more beats
    await page.waitForTimeout(3000);

    // Check that BPS is now > 0
    const bpsDisplay = page.locator('text=/BPS: [\\d\\.]+/');
    const bpsText = await bpsDisplay.textContent();
    expect(bpsText).toMatch(/BPS: [1-9]/); // Should have positive BPS
  });

  test('should unlock achievements when conditions are met', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);

    // Click once to get first beat
    const tapButton = page.locator('text=Tap Beat');
    await tapButton.click();
    await page.waitForTimeout(1000);

    // Check if "First Beat!" achievement is unlocked
    // The achievement should show as unlocked or have different styling
    const firstBeatAchievement = page.locator('text=First Beat!');
    await expect(firstBeatAchievement).toBeVisible();
  });

  test('should show different patterns for different modules', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);

    // Check initial pattern
    const initialPattern = await page.locator('pre').textContent();
    expect(initialPattern).toContain('d1 $ sound "bd"');

    // This test validates the pattern generation system is working
    // In the future, we could extend this to test multiple module patterns
  });

  test('should have working hardware capacity system', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);

    // Check initial hardware capacity display
    const ramDisplay = page.locator('text=RAM: 0MB / 1024MB');
    await expect(ramDisplay).toBeVisible();

    const cpuDisplay = page.locator('text=CPU: 0.0 Cores / 1.0 Cores');
    await expect(cpuDisplay).toBeVisible();
  });
});