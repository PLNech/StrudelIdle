import { test, expect } from '@playwright/test';

test.describe('Save Migration Tests', () => {
  test('should handle missing codeOMatic field in save data', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);
    
    // Inject a save file missing the codeOMatic field to simulate old save
    await page.evaluate(() => {
      const oldSave = {
        beats: 1000,
        bps: 10,
        modules: {},
        hardware: {
          ram: { total: 1024, used: 0 },
          cpu: { total: 2, used: 0 },
          dsp: { total: 0, used: 0 },
          storage: { total: 500, used: 0 },
        },
        newsFeed: [],
        achievements: {},
        strudelCode: 's("bd")',
        strudelBPM: 60,
        // Missing codeOMatic, bpmUpgrades, sampleBanks fields
        version: '0.9.0',
        lastSaved: Date.now() - 10000
      };
      
      localStorage.setItem('algorave-idle-save', JSON.stringify(oldSave));
      location.reload();
    });
    
    await page.waitForTimeout(3000);
    
    // Should not crash and should have default values
    await expect(page.locator('text=BPM Control')).toBeVisible();
    await expect(page.locator('text=60 BPM')).toBeVisible();
    
    // Should show Code-o-matic section without errors
    await expect(page.locator('text=Code-o-matic')).toBeVisible();
  });

  test('should handle missing bpmUpgrades field', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);
    
    // Inject save without bpmUpgrades
    await page.evaluate(() => {
      const oldSave = {
        beats: 500,
        bps: 5,
        strudelBPM: 80, // Had manually set BPM before upgrades existed
        codeOMatic: {
          enabled: false,
          purchased: false,
          cost: 1000,
          generationInterval: 10,
          lastGeneration: 0,
          complexity: 0.3
        },
        // Missing bpmUpgrades field
        version: '1.0.0',
        lastSaved: Date.now() - 5000
      };
      
      localStorage.setItem('algorave-idle-save', JSON.stringify(oldSave));
      location.reload();
    });
    
    await page.waitForTimeout(3000);
    
    // Should have BPM upgrade system with defaults
    await expect(page.locator('[data-testid="bpm-upgrade-70"]')).toBeVisible();
    
    // Should preserve existing BPM but constrain to available options
    const currentBPM = await page.locator('text=/\\d+ BPM/').textContent();
    expect(currentBPM).toMatch(/\d+ BPM/);
  });

  test('should preserve existing data during migration', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);
    
    // Create a complete new save and verify migration preserves data
    await page.evaluate(() => {
      const newSave = {
        beats: 2500,
        bps: 25,
        strudelBPM: 120,
        codeOMatic: {
          enabled: true,
          purchased: true,
          cost: 1000,
          generationInterval: 10,
          lastGeneration: Date.now() - 15000,
          complexity: 0.7
        },
        bpmUpgrades: {
          unlockedBPMs: [60, 70, 80, 90, 100, 120],
          hasSlider: false,
          sliderCost: 2000
        },
        version: '1.1.0',
        lastSaved: Date.now() - 1000
      };
      
      localStorage.setItem('algorave-idle-save', JSON.stringify(newSave));
      location.reload();
    });
    
    await page.waitForTimeout(3000);
    
    // Should preserve the custom data
    await expect(page.locator('text=120 BPM')).toBeVisible();
    
    // Should have multiple BPM options available
    const bpm70Button = page.locator('button:has-text("70")');
    const bpm100Button = page.locator('button:has-text("100")');
    await expect(bpm70Button).toBeVisible();
    await expect(bpm100Button).toBeVisible();
    
    // Code-o-matic should be enabled
    await expect(page.locator('text=Code-o-matic')).toBeVisible();
  });

  test('should not crash with completely malformed save data', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);
    
    // Test with malformed JSON and partial data
    await page.evaluate(() => {
      const badSave = {
        beats: "not_a_number",
        modules: null,
        // Missing most required fields
        version: 'corrupt'
      };
      
      localStorage.setItem('algorave-idle-save', JSON.stringify(badSave));
      location.reload();
    });
    
    await page.waitForTimeout(3000);
    
    // Should fall back to defaults and not crash
    await expect(page.locator('text=StrudelIdle')).toBeVisible();
    await expect(page.locator('text=60 BPM')).toBeVisible();
    await expect(page.locator('text=BPM Control')).toBeVisible();
  });
});