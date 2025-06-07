import { test, expect } from '@playwright/test';

test.describe('Strudel Audio Validation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.waitForTimeout(2000); // Allow Strudel to initialize
  });

  test('should initialize Strudel successfully', async ({ page }) => {
    // Check if Strudel initialized
    const strudelReady = await page.evaluate(() => {
      return (window as any).strudelInitialized === true;
    });
    expect(strudelReady).toBe(true);
    
    // Check for evaluate function
    const hasEvaluate = await page.evaluate(() => {
      return typeof (window as any).evaluate === 'function';
    });
    expect(hasEvaluate).toBe(true);
  });

  test('should log available samples at boot', async ({ page }) => {
    // Monitor console logs for sample logging
    const logs: string[] = [];
    page.on('console', msg => {
      if (msg.text().includes('SAMPLE INVENTORY') || 
          msg.text().includes('Available Samples') ||
          msg.text().includes('Testing basic samples')) {
        logs.push(msg.text());
      }
    });

    await page.reload();
    await page.waitForTimeout(3000);
    
    expect(logs.length).toBeGreaterThan(0);
    expect(logs.some(log => log.includes('SAMPLE INVENTORY'))).toBe(true);
  });

  test('should play basic pattern without errors', async ({ page }) => {
    // Monitor console for errors
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    // Click start button
    await page.click('button:has-text("Start AlgoRave")');
    await page.waitForTimeout(2000);

    // Check for specific Strudel error
    const hasStrudelError = errors.some(error => 
      error.includes("Cannot read properties of undefined (reading '#<tt>')")
    );
    expect(hasStrudelError).toBe(false);

    // Stop audio
    await page.click('button:has-text("Stop AlgoRave")');
  });

  test('should validate pattern code correctly', async ({ page }) => {
    // Test pattern validation function
    const validationResults = await page.evaluate(() => {
      // Access the validation function if exposed
      if ((window as any).validatePatternCode) {
        return {
          validPattern: (window as any).validatePatternCode('s("bd")'),
          emptyPattern: (window as any).validatePatternCode(''),
          invalidPattern: (window as any).validatePatternCode('invalid<>pattern'),
          unbalancedBrackets: (window as any).validatePatternCode('s("bd"[')
        };
      }
      return null;
    });

    if (validationResults) {
      expect(validationResults.validPattern).toBe('s("bd")');
      expect(validationResults.emptyPattern).toBe('s("bd")'); // Should fallback
      expect(validationResults.invalidPattern).toBe('s("bd")'); // Should fallback
      expect(validationResults.unbalancedBrackets).toBe('s("bd")'); // Should fallback
    }
  });

  test('should handle BPM changes correctly', async ({ page }) => {
    // Start audio
    await page.click('button:has-text("Start AlgoRave")');
    await page.waitForTimeout(1000);

    // Test BPM adjustment
    await page.fill('input[type="range"]', '140');
    await page.waitForTimeout(1000);

    // Verify no errors occurred
    const hasErrors = await page.evaluate(() => {
      return (window as any).strudelErrors && (window as any).strudelErrors.length > 0;
    });
    expect(hasErrors).toBeFalsy();

    await page.click('button:has-text("Stop AlgoRave")');
  });

  test('should handle sample toggling without breaking audio', async ({ page }) => {
    // Start audio
    await page.click('button:has-text("Start AlgoRave")');
    await page.waitForTimeout(1000);

    // Try toggling samples if available
    const sampleToggles = page.locator('input[type="checkbox"]').first();
    if (await sampleToggles.count() > 0) {
      await sampleToggles.click();
      await page.waitForTimeout(500);
      await sampleToggles.click();
      await page.waitForTimeout(500);
    }

    // Verify audio is still working
    const isPlaying = await page.locator('button:has-text("Stop AlgoRave")').count();
    expect(isPlaying).toBeGreaterThan(0);

    await page.click('button:has-text("Stop AlgoRave")');
  });
});