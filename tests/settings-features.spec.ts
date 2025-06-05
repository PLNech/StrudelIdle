import { test, expect } from '@playwright/test';

test.describe('AlgoRave IDLE - Settings & New Features', () => {
  test('should open and close settings menu', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);

    // Find and click the settings button
    const settingsButton = page.locator('text=⚙️ Settings');
    await expect(settingsButton).toBeVisible();
    await settingsButton.click();

    // Settings modal should be open
    await expect(page.locator('text=Game Settings')).toBeVisible();
    await expect(page.locator('text=Statistics')).toBeVisible();
    await expect(page.locator('text=Save & Load')).toBeVisible();

    // Close settings
    await page.locator('text=Close Settings').click();
    
    // Settings should be closed, button should be visible again
    await expect(settingsButton).toBeVisible();
  });

  test('should display game statistics in settings', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);

    // Click a few beats to generate some stats
    const tapButton = page.locator('text=Tap Beat');
    await tapButton.click();
    await tapButton.click();
    await page.waitForTimeout(500);

    // Open settings
    await page.locator('text=⚙️ Settings').click();

    // Check that statistics are displayed
    await expect(page.locator('text=Total Playtime:')).toBeVisible();
    await expect(page.locator('text=Total Beats:')).toBeVisible();
    await expect(page.locator('text=Current BPS:')).toBeVisible();
    await expect(page.locator('text=Modules Owned:')).toBeVisible();
  });

  test('should have save/load functionality buttons', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);

    // Open settings
    await page.locator('text=⚙️ Settings').click();

    // Check for save/load buttons
    await expect(page.locator('text=💾 Save Game')).toBeVisible();
    await expect(page.locator('text=📤 Export Save')).toBeVisible();
    await expect(page.locator('text=📥 Import Save')).toBeVisible();
    await expect(page.locator('text=🗑️ Reset Game')).toBeVisible();
  });

  test('should show correct Strudel syntax in pattern display', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);

    // Check that the new Strudel syntax is displayed
    const strudelCode = page.locator('pre');
    const codeText = await strudelCode.textContent();
    
    // Should be s("bd") not d1 $ sound "bd"
    expect(codeText).toContain('s("bd")');
    expect(codeText).not.toContain('d1 $');
  });

  test('should save game when save button is clicked', async ({ page }) => {
    const consoleMessages: string[] = [];
    page.on('console', (msg) => {
      consoleMessages.push(`${msg.type()}: ${msg.text()}`);
    });

    await page.goto('/');
    await page.waitForTimeout(2000);

    // Generate some game state
    await page.locator('text=Tap Beat').click();
    
    // Open settings and save
    await page.locator('text=⚙️ Settings').click();
    await page.locator('text=💾 Save Game').click();

    // Should see save confirmation in console
    const saveMessage = consoleMessages.some(msg => 
      msg.includes('Game saved successfully')
    );
    expect(saveMessage).toBe(true);
  });
});