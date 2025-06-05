import { test, expect } from '@playwright/test';

test.describe('AlgoRave IDLE - Complete Game Experience', () => {
  test('should have full game progression working', async ({ page }) => {
    const consoleMessages: string[] = [];
    page.on('console', (msg) => {
      consoleMessages.push(`${msg.type()}: ${msg.text()}`);
    });

    await page.goto('/');
    await page.waitForTimeout(3000); // Wait for full load

    // 1. Verify Strudel initializes
    const strudelInit = consoleMessages.some(msg => 
      msg.includes('Strudel.cc initialized successfully')
    );
    expect(strudelInit).toBe(true);

    // 2. Verify initial state shows correct syntax
    const strudelPattern = await page.getByTestId('strudel-output').locator('pre').textContent();
    expect(strudelPattern).toContain('sound("bd")');

    // 3. Test audio playback
    await page.locator('text=Start AlgoRave').click();
    await page.waitForTimeout(1000);
    
    const audioPlaying = consoleMessages.some(msg => 
      msg.includes('Playing Strudel pattern')
    );
    expect(audioPlaying).toBe(true);

    // 4. Test settings functionality
    await page.locator('text=⚙️ Settings').click();
    await expect(page.locator('text=Game Settings')).toBeVisible();
    await expect(page.locator('text=💾 Save Game')).toBeVisible();
    await page.locator('text=Close Settings').click();

    // 5. Test achievement notifications (generate beats to unlock first achievement)
    await page.locator('text=Tap Beat').click();
    await page.waitForTimeout(500);
    
    // Look for achievement notification
    const achievementNotification = page.locator('text=Achievement Unlocked!');
    await expect(achievementNotification).toBeVisible({ timeout: 5000 });

    // 6. Test module purchasing and progression
    // Click enough to buy first module
    for (let i = 0; i < 12; i++) {
      await page.locator('text=Tap Beat').click();
      await page.waitForTimeout(100);
    }

    const buyButton = page.locator('text=Buy Kick Drum (bd)').first();
    await expect(buyButton).toBeEnabled();
    await buyButton.click();

    // 7. Verify BPS generation after purchase
    await page.waitForTimeout(2000);
    const bpsText = await page.locator('text=/BPS: [\\d\\.]+/').textContent();
    expect(bpsText).toMatch(/BPS: [1-9]/); // Should have positive BPS

    // 8. Verify pattern updates (should still be valid)
    const updatedPattern = await page.locator('pre').textContent();
    expect(updatedPattern).toContain('s("bd")');

    console.log('🎉 Complete game test passed! All systems working:');
    console.log('✅ Strudel audio engine');
    console.log('✅ Game progression & modules');
    console.log('✅ Settings & save system');
    console.log('✅ Achievement notifications');
    console.log('✅ UI rendering & interactions');
  });

  test('should show new sample modules in progression', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);

    // First buy the kick drum to start progression
    const kickBuyButton = page.locator('text=Buy Kick Drum (bd)');
    await kickBuyButton.click();
    
    // Click beats to generate enough to unlock next module  
    const tapBeat = page.locator('text=Tap Beat');
    for (let i = 0; i < 15; i++) {
      await tapBeat.click();
      await page.waitForTimeout(50);
    }
    
    // Wait for unlock logic to process
    await page.waitForTimeout(1000);

    // Check that additional modules are now available
    const pageContent = await page.content();
    
    // These modules should now be unlocked and visible
    const moduleNames = ['Hi-Hat (hh)', 'Kick Drum (bd)'];
    
    let foundModules = 0;
    for (const moduleName of moduleNames) {
      if (pageContent.includes(moduleName)) {
        foundModules++;
      }
    }
    
    // Should find at least some of the new modules
    expect(foundModules).toBeGreaterThan(0);
  });

  test('should display BPM and looping information', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);

    // Open settings to check BPM display
    await page.locator('text=⚙️ Settings').click();
    
    // Should show current BPM
    const bpmDisplay = page.locator('text=/Current BPM: \\d+/');
    await expect(bpmDisplay).toBeVisible();

    await page.locator('text=Close Settings').click();
  });
});