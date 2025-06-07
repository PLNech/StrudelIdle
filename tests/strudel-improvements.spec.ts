import { test, expect } from '@playwright/test';

test.describe('Strudel Improvements Validation', () => {
  test('should properly stop audio when stop button is clicked', async ({ page }) => {
    const consoleMessages: string[] = [];
    page.on('console', (msg) => {
      consoleMessages.push(`${msg.type()}: ${msg.text()}`);
    });

    await page.goto('/');
    await page.waitForTimeout(3000);

    // Start audio
    await page.locator('text=Start AlgoRave').click();
    await page.waitForTimeout(1000);

    // Should show stop button
    await expect(page.locator('text=Stop AlgoRave')).toBeVisible();

    // Stop audio
    await page.locator('text=Stop AlgoRave').click();
    await page.waitForTimeout(500);

    // Should show start button again
    await expect(page.locator('text=Start AlgoRave')).toBeVisible();

    // Check console for stop messages
    const stopMessages = consoleMessages.filter(msg => 
      msg.includes('stopped') || msg.includes('hush') || msg.includes('suspended')
    );
    expect(stopMessages.length).toBeGreaterThan(0);
  });

  test('should show debug information when debug mode is enabled', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);

    // Click debug button
    await page.locator('text=Debug').click();
    await page.waitForTimeout(500);

    // Should show debug info
    await expect(page.locator('h3:has-text("Debug Info")')).toBeVisible();
    await expect(page.locator('strong:has-text("Status:")')).toBeVisible();
    await expect(page.locator('strong:has-text("BPM:")')).toBeVisible();
    await expect(page.locator('strong:has-text("Ready:")')).toBeVisible();
    await expect(page.locator('strong:has-text("Pattern Length:")')).toBeVisible();
    await expect(page.locator('strong:has-text("Active Modules:")')).toBeVisible();
    await expect(page.locator('strong:has-text("Raw Pattern:")')).toBeVisible();

    // Should show Hide Debug button
    await expect(page.locator('text=Hide Debug')).toBeVisible();
  });

  test('should support different visual modes', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);

    // Check default mode
    const visualSelect = page.locator('select').first();
    await expect(visualSelect).toHaveValue('code');

    // Change to punchcard mode
    await visualSelect.selectOption('punchcard');
    await page.waitForTimeout(500);

    // Pattern should now include punchcard visualization
    const strudelOutput = page.getByTestId('strudel-output');
    await expect(strudelOutput).toContainText('.punchcard()');

    // Change to piano roll mode
    await visualSelect.selectOption('pianoroll');
    await page.waitForTimeout(500);

    // Pattern should now include pianoroll visualization
    await expect(strudelOutput).toContainText('.pianoroll()');
  });

  test('should have working Hush button when playing', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(3000);

    // Start audio first
    await page.locator('text=Start AlgoRave').click();
    await page.waitForTimeout(1000);

    // Hush button should be enabled
    const hushButton = page.locator('text=Hush');
    await expect(hushButton).toBeEnabled();

    // Click hush
    await hushButton.click();
    await page.waitForTimeout(500);

    // Pattern should still be playing (hush just silences temporarily)
    await expect(page.locator('text=Stop AlgoRave')).toBeVisible();
  });

  test('should show correct BPM range control', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);

    // Find BPM slider
    const bpmSlider = page.locator('input[type="range"]');
    await expect(bpmSlider).toBeVisible();

    // Check range attributes
    await expect(bpmSlider).toHaveAttribute('min', '60');
    await expect(bpmSlider).toHaveAttribute('max', '180');

    // Check initial value
    await expect(bpmSlider).toHaveValue('60');

    // BPM display should show current value
    await expect(page.locator('text=60').last()).toBeVisible();
  });

  test('should use correct Strudel syntax s() instead of sound()', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);

    // Check that pattern uses s() syntax
    const strudelOutput = page.getByTestId('strudel-output');
    await expect(strudelOutput).toContainText('s("bd")');
    await expect(strudelOutput).not.toContainText('sound("bd")');

    // Buy a module and check syntax is still correct
    for (let i = 0; i < 12; i++) {
      await page.locator('text=Tap Beat').click();
      await page.waitForTimeout(50);
    }

    const buyButton = page.locator('text=Buy Kick Drum (bd)').first();
    await buyButton.click();
    await page.waitForTimeout(1000);

    // Pattern should still use s() syntax
    await expect(strudelOutput).toContainText('s("bd")');
    await expect(strudelOutput).not.toContainText('sound("bd")');
  });
});