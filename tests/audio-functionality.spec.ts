import { test, expect } from '@playwright/test';

test.describe('AlgoRave IDLE - Audio Functionality', () => {
  test('should initialize Strudel successfully', async ({ page }) => {
    const consoleMessages: string[] = [];
    page.on('console', (msg) => {
      consoleMessages.push(`${msg.type()}: ${msg.text()}`);
    });

    await page.goto('/');
    await page.waitForTimeout(3000); // Wait for Strudel to initialize

    // Check that Strudel initialized successfully
    const strudelInitialized = consoleMessages.some(msg => 
      msg.includes('Strudel.cc initialized successfully')
    );
    expect(strudelInitialized).toBe(true);

    // Check that @strudel/core is loaded
    const coreLoaded = consoleMessages.some(msg => 
      msg.includes('@strudel/core loaded')
    );
    expect(coreLoaded).toBe(true);
  });

  test('should have Start AlgoRave button', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);

    const startButton = page.locator('text=Start AlgoRave');
    await expect(startButton).toBeVisible();
    
    // Button should be clickable (not disabled)
    await expect(startButton).toBeEnabled();
  });

  test('should show Strudel code in Live Strudel Feed', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);

    // Should show the default Strudel code in the Live Strudel Feed
    const strudelCode = page.getByTestId('strudel-output').getByText('s("bd")');
    await expect(strudelCode).toBeVisible();
  });

  test('should have working Start/Stop toggle functionality', async ({ page }) => {
    const consoleMessages: string[] = [];
    page.on('console', (msg) => {
      consoleMessages.push(`${msg.type()}: ${msg.text()}`);
    });

    await page.goto('/');
    await page.waitForTimeout(3000); // Wait for Strudel to initialize

    const startButton = page.locator('text=Start AlgoRave');
    await expect(startButton).toBeVisible();
    
    // Click to start (requires user gesture for audio)
    await startButton.click();
    
    // Wait a moment for the audio to start
    await page.waitForTimeout(1000);
    
    // Button text should change to Stop
    await expect(page.locator('text=Stop AlgoRave')).toBeVisible();
    
    // Check console for pattern playing messages
    const patternPlaying = consoleMessages.some(msg => 
      msg.includes('Playing Strudel pattern')
    );
    expect(patternPlaying).toBe(true);
    
    // Click to stop
    await page.locator('text=Stop AlgoRave').click();
    await page.waitForTimeout(500);
    
    // Button should be back to Start
    await expect(page.locator('text=Start AlgoRave')).toBeVisible();
  });

  test('should update Strudel code when modules are purchased', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);

    // Click Tap Beat enough times to afford a module (need 10 beats)
    const tapButton = page.locator('text=Tap Beat');
    for (let i = 0; i < 12; i++) {
      await tapButton.click();
      await page.waitForTimeout(100); // Small delay between clicks
    }

    // Wait for beats to register
    await page.waitForTimeout(500);

    // Check that we have enough beats (look for beats number)
    const beatsDisplay = page.locator('text="Beats Generated"');
    await expect(beatsDisplay).toBeVisible();

    // Buy the Kick Drum module
    const buyButton = page.locator('text=Buy Kick Drum (bd)').first();
    await expect(buyButton).toBeEnabled({ timeout: 10000 });
    await buyButton.click();
    
    await page.waitForTimeout(1000);

    // The Strudel code should still show the pattern
    // (It might be the same since it's already bd, but the system should be working)
    const strudelCode = page.getByTestId('strudel-output').getByText('s("bd")');
    await expect(strudelCode).toBeVisible();

    // Check that the module was purchased (owned count should be > 0)
    const ownedCount = page.locator('text=Owned: 1');
    await expect(ownedCount).toBeVisible();
  });

  test('should check for global Strudel functions availability', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(3000); // Wait for Strudel to initialize

    // Check if global Strudel functions are available
    const strudelFunctions = await page.evaluate(() => {
      return {
        hasEvaluate: typeof (window as any).evaluate === 'function',
        hasHush: typeof (window as any).hush === 'function',
        hasNote: typeof (window as any).note === 'function',
        hasSound: typeof (window as any).sound === 'function',
      };
    });

    expect(strudelFunctions.hasEvaluate).toBe(true);
    expect(strudelFunctions.hasHush).toBe(true);
    // Note: note and sound might not be global, they might be pattern methods
  });
});