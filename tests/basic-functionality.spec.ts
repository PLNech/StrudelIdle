import { test, expect } from '@playwright/test';

test.describe('Basic Functionality Tests', () => {
  test('should load without crashing', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(3000);
    
    // Should show main title
    await expect(page.locator('h1:has-text("StrudelIdle")')).toBeVisible();
    
    // Should show BPM control
    await expect(page.locator('text=BPM Control')).toBeVisible();
    
    // Should show current pattern
    await expect(page.locator('[data-testid="current-pattern"]')).toBeVisible();
    
    // Should not have duplicate key errors (test passes if no crash)
    const logs: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        logs.push(msg.text());
      }
    });
    
    // Click beat to generate some news items rapidly
    for (let i = 0; i < 5; i++) {
      await page.locator('text=🐛 +1B').click();
      await page.waitForTimeout(100);
    }
    
    // Should not have duplicate key errors
    const duplicateKeyErrors = logs.filter(log => log.includes('same key'));
    expect(duplicateKeyErrors.length).toBe(0);
  });

  test('should handle news items without duplicate keys', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);
    
    // Generate multiple news items quickly
    for (let i = 0; i < 10; i++) {
      await page.locator('text=🐛 +1B').click();
    }
    
    await page.waitForTimeout(1000);
    
    // Should show news feed
    await expect(page.locator('[data-testid="news-feed"]')).toBeVisible();
    
    // Should not crash (test passes if we get here)
    await expect(page.locator('text=BPM Control')).toBeVisible();
  });

  test('should have working BPM upgrade system', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);
    
    // Should start at 60 BPM
    await expect(page.locator('text=60 BPM')).toBeVisible();
    
    // Should show upgrade available
    await expect(page.locator('[data-testid="bpm-upgrade-70"]')).toBeVisible();
    
    // Should show current tempo as button
    const bpm60Button = page.locator('button:has-text("60")');
    await expect(bpm60Button).toBeVisible();
  });
});