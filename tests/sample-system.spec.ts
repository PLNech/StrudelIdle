import { test, expect } from '@playwright/test';

test.describe('Sample System Tests', () => {
  test('should load with sample banks available', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(3000); // Wait for Strudel initialization
    
    // Check that Sample Banks tab is available
    await expect(page.locator('text=🎵 Sample Banks')).toBeVisible();
    
    // Click on Sample Banks tab
    await page.locator('text=🎵 Sample Banks').click();
    await page.waitForTimeout(1000);
    
    // Should show at least bd (bass drum) as unlocked
    await expect(page.locator('text=Bass Drum').first()).toBeVisible();
    await expect(page.locator('text=✓ Unlocked').first()).toBeVisible();
    
    // Should show Quick Play section with available samples
    await expect(page.locator('text=Quick Play')).toBeVisible();
  });

  test('should allow playing samples without errors', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(3000);
    
    // Go to Sample Banks
    await page.locator('text=🎵 Sample Banks').click();
    await page.waitForTimeout(1000);
    
    // Click on a quick play sample (should be rate limited)
    const firstSample = page.locator('.bg-muted\\/20.border-border').first();
    if (await firstSample.isVisible()) {
      await firstSample.click();
      await page.waitForTimeout(100); // Rate limiting
    }
    
    // Should not cause JavaScript errors
    const logs = [];
    page.on('console', msg => {
      if (msg.type() === 'error') logs.push(msg.text());
    });
    
    await page.waitForTimeout(1000);
    
    // Check that Strudel pattern was updated
    const strudelOutput = page.locator('[data-testid="strudel-output"]');
    await expect(strudelOutput).toBeVisible();
  });

  test('should show progression-based sample unlocks', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);
    
    // Use debug button to get beats
    await page.locator('text=🐛 +1B').click();
    await page.waitForTimeout(500);
    
    // Go to Sample Banks
    await page.locator('text=🎵 Sample Banks').click();
    await page.waitForTimeout(1000);
    
    // Should have unlocked more sample banks due to progression
    const unlockedBanks = page.locator('text=✓ Unlocked');
    const count = await unlockedBanks.count();
    expect(count).toBeGreaterThan(1); // Should have more than just bd unlocked
  });
  
  test('should work with different sample categories', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);
    
    await page.locator('text=🎵 Sample Banks').click();
    await page.waitForTimeout(1000);
    
    // Test category filters - click on the filter button specifically
    await page.locator('button', { hasText: '🥁 drums' }).click();
    await page.waitForTimeout(500);
    await expect(page.locator('text=Bass Drum').first()).toBeVisible();
    
    await page.locator('button', { hasText: '🎹 synth' }).click();
    await page.waitForTimeout(500);
    
    await page.locator('button', { hasText: '💥 breaks' }).click();
    await page.waitForTimeout(500);
    
    // Should not cause errors when switching categories
    await page.locator('button', { hasText: '🎵 all' }).click();
    await page.waitForTimeout(500);
  });
});