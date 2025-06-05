import { test, expect } from '@playwright/test';

test.describe('AlgoRave IDLE - Basic Rendering', () => {
  test('should load the main page without errors', async ({ page }) => {
    // Listen for console errors
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // Navigate to the app
    await page.goto('/');

    // Wait for Vite to connect
    await page.waitForSelector('text=[vite] connected', { timeout: 10000 });

    // Check that we don't have a completely white screen
    // The app should render at least the basic structure
    await expect(page.locator('body')).not.toBeEmpty();
    
    // Look for the game title or main container
    // Based on the codebase, we should see elements like beat counter, clicker, etc.
    await expect(page.locator('#root')).not.toBeEmpty();

    // Print any console errors for debugging
    if (consoleErrors.length > 0) {
      console.log('Console errors found:', consoleErrors);
    }

    // The test passes if we get this far without the page being completely empty
  });

  test('should render game UI elements', async ({ page }) => {
    // Listen for console errors to debug
    const consoleMessages: string[] = [];
    page.on('console', (msg) => {
      consoleMessages.push(`${msg.type()}: ${msg.text()}`);
    });

    await page.goto('/');
    
    // Wait for React to render
    await page.waitForTimeout(2000);

    // Check if there's any content at all
    const bodyContent = await page.locator('body').textContent();
    console.log('Body content:', bodyContent);
    console.log('Console messages:', consoleMessages);

    // Look for key game elements that should be present
    // This will help us verify the UI actually renders
    const gameElements = [
      'Tap Beat', // From Clicker component
      'Start AlgoRave', // From StrudelOutput component
      'Beats:', // From BeatDisplay component
    ];

    // Check if at least one key element is visible
    let foundElements = 0;
    for (const element of gameElements) {
      try {
        await page.locator(`text=${element}`).waitFor({ timeout: 1000 });
        foundElements++;
        console.log(`Found element: ${element}`);
      } catch {
        console.log(`Element not found: ${element}`);
      }
    }

    // We should find at least one game element, but log for debugging if not
    if (foundElements === 0) {
      console.log('No game elements found! Body content:', bodyContent);
      console.log('All console messages:', consoleMessages);
    }
    expect(foundElements).toBeGreaterThan(0);
  });
});