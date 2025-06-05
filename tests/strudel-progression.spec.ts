import { test, expect } from '@playwright/test';

test.describe('Strudel Progression System', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');
  });

  test('should start with basic kick drum module unlocked', async ({ page }) => {
    // Check that the basic kick drum module heading is visible
    await expect(page.locator('h3:has-text("Kick Drum (bd)")')).toBeVisible();
    
    // Should be able to purchase it - look for the Buy button specifically for this module
    const kickDrumSection = page.locator('div').filter({ hasText: 'Kick Drum (bd)' }).filter({ hasText: 'Basic kick drum' });
    const purchaseButton = kickDrumSection.locator('button', { hasText: 'Buy' });
    await expect(purchaseButton).toBeEnabled();
  });

  test('should unlock hi-hat after purchasing kick drum', async ({ page }) => {
    // Purchase kick drum first
    const kickDrumSection = page.locator('div').filter({ hasText: 'Kick Drum (bd)' }).filter({ hasText: 'Basic kick drum' });
    const buyButton = kickDrumSection.locator('button', { hasText: 'Buy' });
    await buyButton.click();
    
    // Click the clicker to generate beats (need 25 total beats)
    const clicker = page.locator('[data-testid="clicker"]');
    for (let i = 0; i < 15; i++) { // Click to generate more beats
      await clicker.click();
      await page.waitForTimeout(100);
    }
    
    // Wait for hi-hat to unlock
    await page.waitForTimeout(1000);
    
    // Check if hi-hat appears
    await expect(page.locator('h3:has-text("Hi-Hat (hh)")')).toBeVisible();
  });

  test('should generate basic Strudel pattern', async ({ page }) => {
    // Purchase kick drum to start generating patterns
    const buyButton = page.locator('button', { hasText: 'Buy' }).first();
    await buyButton.click();
    
    // Check that Strudel code is displayed
    const strudelOutput = page.locator('[data-testid="strudel-output"]');
    await expect(strudelOutput).toBeVisible();
    
    // Should contain basic sound pattern
    const strudelText = await strudelOutput.textContent();
    expect(strudelText).toContain('sound("bd")');
  });

  test('should unlock sequence builder and show combined patterns', async ({ page }) => {
    // Purchase kick drum first
    const kickDrumSection = page.locator('div').filter({ hasText: 'Kick Drum (bd)' }).filter({ hasText: 'Basic kick drum' });
    let buyButton = kickDrumSection.locator('button', { hasText: 'Buy' });
    await buyButton.click();
    
    // Generate enough beats to unlock hi-hat
    const clicker = page.locator('[data-testid="clicker"]');
    
    // Wait for hi-hat to become available and click more as needed
    let attempts = 0;
    while (attempts < 50) {
      await clicker.click();
      await page.waitForTimeout(100);
      
      const hiHatButton = page.getByRole('button', { name: 'Buy Hi-Hat (hh)' });
      if (await hiHatButton.isEnabled()) {
        await hiHatButton.click();
        break;
      }
      attempts++;
    }
    
    // Generate enough beats to unlock sequence builder (need 120 total)
    for (let i = 0; i < 90; i++) {
      await clicker.click();
      await page.waitForTimeout(30);
    }
    
    // Wait for sequence builder to unlock
    await page.waitForTimeout(1000);
    
    // Should see sequence builder module
    await expect(page.locator('h3:has-text("Sequence Builder")')).toBeVisible();
    
    // Purchase sequence builder
    const sequenceButton = page.getByRole('button', { name: 'Buy Sequence Builder' });
    await sequenceButton.click();
    
    // Check that pattern now includes sequences
    const strudelOutput = page.locator('[data-testid="strudel-output"]');
    const strudelText = await strudelOutput.textContent();
    expect(strudelText).toMatch(/sound\(".*\s.*"\)/); // Should have space-separated pattern
  });

  test('should apply mini-notation features progressively', async ({ page }) => {
    // Fast-track to testing mini-notation by adding beats manually
    await page.evaluate(() => {
      const gameContext = (window as any).gameContext;
      if (gameContext) {
        gameContext.addBeats(500); // Add enough beats to unlock several features
      }
    });
    
    // Purchase multiple modules to see progression
    const buyButtons = page.locator('button', { hasText: 'Buy' });
    const buttonCount = await buyButtons.count();
    
    for (let i = 0; i < Math.min(buttonCount, 4); i++) {
      const button = buyButtons.nth(i);
      if (await button.isEnabled()) {
        await button.click();
        await page.waitForTimeout(500);
      }
    }
    
    // Check that Strudel code includes advanced features
    const strudelOutput = page.locator('[data-testid="strudel-output"]');
    const strudelText = await strudelOutput.textContent();
    
    // Should have complex patterns with spaces, possibly rests or multipliers
    expect(strudelText).toMatch(/sound\(".*(\s|~|\*|\/|<|>|\[|\]).*"\)/);
  });

  test('should unlock DSP hardware when polyphony is available', async ({ page }) => {
    // Fast-track to polyphony unlock
    await page.evaluate(() => {
      const gameContext = (window as any).gameContext;
      if (gameContext) {
        gameContext.addBeats(1000); // Add beats to reach polyphony
      }
    });
    
    // Wait for DSP hardware type to unlock
    await page.waitForTimeout(2000);
    
    // Check hardware shop for DSP section
    const hardwareTab = page.locator('text=Hardware Shop');
    await hardwareTab.click();
    
    // Should see DSP hardware available
    await expect(page.locator('text=DSP')).toBeVisible();
  });

  test('should show phase progression in news feed', async ({ page }) => {
    // Purchase first module
    const buyButton = page.locator('button', { hasText: 'Buy' }).first();
    await buyButton.click();
    
    // Wait for module unlock notifications
    await page.waitForTimeout(3000);
    
    // Check news feed for unlock messages
    const newsFeed = page.locator('[data-testid="news-feed"]');
    await expect(newsFeed).toContainText('NEW MODULE UNLOCKED');
  });

  test('should apply effects to patterns when unlocked', async ({ page }) => {
    // Fast-track to effects phase
    await page.evaluate(() => {
      const gameContext = (window as any).gameContext;
      if (gameContext) {
        gameContext.addBeats(3500); // Add beats to reach effects phase
      }
    });
    
    await page.waitForTimeout(2000);
    
    // Purchase reverb engine if available
    const reverbButton = page.locator('text=Reverb Engine').locator('..').locator('button', { hasText: 'Buy' });
    if (await reverbButton.isVisible()) {
      await reverbButton.click();
      
      // Check that pattern includes reverb effect
      const strudelOutput = page.locator('[data-testid="strudel-output"]');
      const strudelText = await strudelOutput.textContent();
      expect(strudelText).toContain('.room(');
    }
  });

  test('should generate Euclidean rhythms when unlocked', async ({ page }) => {
    // Fast-track to Euclidean phase
    await page.evaluate(() => {
      const gameContext = (window as any).gameContext;
      if (gameContext) {
        gameContext.addBeats(7000); // Add beats to reach Euclidean phase
      }
    });
    
    await page.waitForTimeout(2000);
    
    // Purchase Euclidean engine if available
    const euclideanButton = page.locator('text=Euclidean Engine').locator('..').locator('button', { hasText: 'Buy' });
    if (await euclideanButton.isVisible()) {
      await euclideanButton.click();
      
      // Check that pattern includes Euclidean notation
      const strudelOutput = page.locator('[data-testid="strudel-output"]');
      const strudelText = await strudelOutput.textContent();
      expect(strudelText).toMatch(/\w+\(\d+,\d+\)/); // Should have (beats,steps) notation
    }
  });

  test('should maintain audio functionality with Strudel patterns', async ({ page }) => {
    // Grant audio permissions
    await page.context().grantPermissions(['microphone']);
    
    // Purchase a module to start audio
    const buyButton = page.locator('button', { hasText: 'Buy' }).first();
    await buyButton.click();
    
    // Click to start audio
    const clickArea = page.locator('[data-testid="clicker"]');
    await clickArea.click();
    
    // Check that audio context is active
    const isAudioActive = await page.evaluate(() => {
      return (window as any).strudelInitialized === true;
    });
    
    expect(isAudioActive).toBe(true);
  });
});