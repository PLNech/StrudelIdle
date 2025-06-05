import { test, expect } from '@playwright/test';

test.describe('AlgoRave IDLE - Dual Audio System', () => {
  test('should have both simple click audio and Strudel patterns', async ({ page }) => {
    const consoleMessages: string[] = [];
    page.on('console', (msg) => {
      consoleMessages.push(`${msg.type()}: ${msg.text()}`);
    });

    await page.goto('/');
    await page.waitForTimeout(3000);

    // 1. Verify Strudel system initializes
    const strudelInit = consoleMessages.some(msg => 
      msg.includes('Strudel.cc initialized successfully')
    );
    expect(strudelInit).toBe(true);

    // 2. Test click feedback (this should work immediately)
    await page.locator('text=Play `bd` (1 Beat)').click();
    await page.waitForTimeout(500);

    // 3. Test Strudel patterns (this requires Start AlgoRave)
    await page.locator('text=Start AlgoRave').click();
    await page.waitForTimeout(1000);

    const patternPlaying = consoleMessages.some(msg => 
      msg.includes('Playing Strudel pattern')
    );
    expect(patternPlaying).toBe(true);

    // 4. Verify pattern structure display
    await expect(page.locator('text=Pattern Structure')).toBeVisible();
    await expect(page.locator('text=Current Pattern')).toBeVisible();
    await expect(page.locator('text=BPM:')).toBeVisible();
    await expect(page.locator('text=Looping:')).toBeVisible();

    // 5. Verify pattern elements preview
    await expect(page.locator('text=Pattern Elements')).toBeVisible();
    await expect(page.locator('text=Basic Notes (Coming Soon)')).toBeVisible();
    await expect(page.locator('text=Chord Progressions (Coming Soon)')).toBeVisible();
    await expect(page.locator('text=Pattern Lines (Coming Soon)')).toBeVisible();
  });

  test('should show structured pattern information', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);

    // Check that the pattern structure shows current state
    const patternDisplay = page.locator('text=Pattern Structure').locator('..').locator('pre');
    const patternText = await patternDisplay.textContent();
    
    // Should show the current Strudel pattern
    expect(patternText).toContain('s("bd")');

    // Check BPM display
    const bpmDisplay = page.locator('text=/BPM: \\d+/');
    await expect(bpmDisplay).toBeVisible();

    // Check looping status
    const loopingDisplay = page.locator('text=/Looping: (ON|OFF)/');
    await expect(loopingDisplay).toBeVisible();
  });

  test('should show progression in pattern complexity', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);

    // Click enough to buy a module
    for (let i = 0; i < 12; i++) {
      await page.locator('text=Play `bd` (1 Beat)').click();
      await page.waitForTimeout(50);
    }

    // Buy a module
    const buyButton = page.locator('text=Buy Kick Drum (bd)').first();
    await buyButton.click();
    await page.waitForTimeout(1000);

    // Pattern should still be visible and structured
    const patternDisplay = page.locator('text=Pattern Structure').locator('..').locator('pre');
    const patternText = await patternDisplay.textContent();
    
    // Should still show a valid pattern
    expect(patternText).toContain('s("bd")');
  });
});