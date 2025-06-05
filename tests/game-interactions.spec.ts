import { test, expect } from '@playwright/test';

test.describe('AlgoRave IDLE - Game Interactions', () => {
  test('should allow clicking the beat button', async ({ page }) => {
    await page.goto('/');
    
    // Wait for the game to load
    await page.waitForTimeout(2000);

    // Find and click the "Tap Beat" button
    const tapBeatButton = page.locator('text=Tap Beat');
    await expect(tapBeatButton).toBeVisible();
    
    // Click the button
    await tapBeatButton.click();
    
    // The beats counter should show some value (even if it's just 1)
    const beatDisplay = page.locator('text=Beats:');
    await expect(beatDisplay).toBeVisible();
  });

  test('should show module shop', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);

    // Look for module shop elements
    // Based on the codebase, we should see modules like "Kick Drum (bd)"
    const moduleElements = page.locator('text=Kick Drum');
    await expect(moduleElements).toBeVisible();
  });

  test('should show hardware shop', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);

    // Look for hardware shop elements
    const hardwareElements = page.locator('text=RAM').or(page.locator('text=CPU'));
    await expect(hardwareElements).toBeVisible();
  });

  test('should show news feed', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);

    // Look for the welcome message in news feed
    const welcomeMessage = page.locator('text=Welcome, budding livecoder');
    await expect(welcomeMessage).toBeVisible();
  });

  test('should show achievements section', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);

    // Look for achievements section
    const achievementsSection = page.locator('text=Achievement').or(page.locator('text=First Beat'));
    await expect(achievementsSection).toBeVisible();
  });
});