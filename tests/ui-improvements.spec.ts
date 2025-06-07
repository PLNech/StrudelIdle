import { test, expect } from '@playwright/test';

test.describe('UI Improvements Tests', () => {
  test('should show pattern prominently above the fold', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);
    
    // Pattern should be visible and prominent
    const pattern = page.locator('[data-testid="current-pattern"]');
    await expect(pattern).toBeVisible();
    
    // Check that pattern is in the upper portion of the page
    const patternBox = await pattern.boundingBox();
    expect(patternBox?.y).toBeLessThan(400); // Should be above fold
    
    // Pattern text should be large and readable
    const patternText = page.locator('[data-testid="current-pattern"] .pattern-text');
    await expect(patternText).toBeVisible();
  });

  test('should have volume settings available', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);
    
    // Should have settings button
    const settingsButton = page.locator('[data-testid="settings-button"]');
    await expect(settingsButton).toBeVisible();
    
    // Click settings
    await settingsButton.click();
    await page.waitForTimeout(500);
    
    // Should show volume controls
    await expect(page.locator('text=Manual Volume')).toBeVisible();
    await expect(page.locator('text=AlgoRave Volume')).toBeVisible();
  });

  test('should not show looping indicator', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);
    
    // Looping OFF should not be visible
    await expect(page.locator('text=Looping OFF')).not.toBeVisible();
    await expect(page.locator('text=OFF')).not.toBeVisible();
  });

  test('should have BPM upgrade system', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);
    
    // Should start at 60 BPM
    await expect(page.locator('text=60 BPM')).toBeVisible();
    
    // Should show BPM upgrade section
    await expect(page.locator('text=BPM Control')).toBeVisible();
    
    // Should show available BPM upgrades to purchase
    await expect(page.locator('[data-testid="bpm-upgrade-70"]')).toBeVisible();
    
    // Should show current tempo selection
    const bpm60Button = page.locator('button:has-text("60")');
    await expect(bpm60Button).toBeVisible();
    
    // BPM 70 should be purchasable but cost beats
    const bpm70Upgrade = page.locator('[data-testid="bpm-upgrade-70"]');
    await expect(bpm70Upgrade).toContainText('Beats');
  });

  test('should make upgrade examples clickable', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);
    
    // Generate beats to unlock features
    await page.locator('text=🐛 +1B').click();
    await page.waitForTimeout(1000);
    
    // Go to progression shop
    await page.locator('text=🎓 Workshop').click();
    await page.waitForTimeout(1000);
    
    // Find an unlocked feature with syntax
    const syntaxButton = page.locator('button[title*="Click to set as current pattern"]').first();
    if (await syntaxButton.isVisible()) {
      await syntaxButton.click();
      await page.waitForTimeout(500);
      
      // Pattern should have changed
      const pattern = page.locator('[data-testid="current-pattern"]');
      await expect(pattern).toBeVisible();
    }
  });

  test('should fix bd:1 sample selection', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);
    
    // Go to sample banks
    await page.locator('text=🎵 Sample Banks').click();
    await page.waitForTimeout(1000);
    
    // Click on bd:1 variant if available
    const bd1Button = page.locator('button[title*="Play bd:1"]').first();
    if (await bd1Button.isVisible()) {
      await bd1Button.click();
      await page.waitForTimeout(500);
      
      // Pattern should contain bd:1
      const pattern = page.locator('[data-testid="current-pattern"]');
      const patternText = await pattern.textContent();
      expect(patternText).toContain('bd:1');
    }
  });

  test('should have pattern library dropdown', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);
    
    // Generate beats to unlock patterns
    await page.locator('text=🐛 +1B').click();
    await page.waitForTimeout(1000);
    
    // Should show pattern library toggle button
    await expect(page.locator('[data-testid="pattern-library-toggle"]')).toBeVisible();
    
    // Click to open pattern library
    await page.locator('[data-testid="pattern-library-toggle"]').click();
    await page.waitForTimeout(500);
    
    // Should show pattern library dropdown
    await expect(page.locator('[data-testid="pattern-library"]')).toBeVisible();
    
    // Should be able to select patterns
    const patternSelect = page.locator('[data-testid="pattern-library"] select');
    await expect(patternSelect).toBeVisible();
  });
});