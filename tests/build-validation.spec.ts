import { test, expect } from '@playwright/test';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';

const execAsync = promisify(exec);

test.describe('Build Validation', () => {
  test('should build successfully without errors', async () => {
    const { stdout, stderr } = await execAsync('npm run build', {
      cwd: process.cwd(),
      timeout: 120000 // 2 minutes timeout
    });

    // Check that build completed successfully (accounting for ANSI escape codes)
    const cleanOutput = stdout.replace(/\x1b\[[0-9;]*m/g, ''); // Remove ANSI codes
    expect(cleanOutput).toContain('vite v');
    expect(cleanOutput).toContain('modules transformed');
    expect(cleanOutput).toContain('dist/index.html');
    expect(cleanOutput).toContain('dist/assets/');

    // Check that there are no TypeScript or critical build errors
    expect(stderr).not.toContain('error TS');
    expect(stderr).not.toContain('Build failed');
    expect(stderr).not.toContain('ERROR');

    // The chunk size warning is acceptable, so we allow it
    const hasChunkWarning = stdout.includes('Some chunks are larger than 500 kB');
    
    // Log build output for debugging if needed
    console.log('Build stdout:', stdout);
    if (stderr) {
      console.log('Build stderr:', stderr);
    }

    // Test passes if build completes (which it did since no exception was thrown)
    expect(true).toBe(true);
  });

  test('should produce valid HTML output', async () => {
    // Run build first
    await execAsync('npm run build', {
      cwd: process.cwd(),
      timeout: 120000
    });

    // Check that index.html exists and has expected content
    
    const indexPath = path.join(process.cwd(), 'dist', 'index.html');
    expect(fs.existsSync(indexPath)).toBe(true);
    
    const indexContent = fs.readFileSync(indexPath, 'utf-8');
    
    // Validate HTML structure
    expect(indexContent).toContain('<!doctype html>');
    expect(indexContent).toContain('<html');
    expect(indexContent).toContain('<head>');
    expect(indexContent).toContain('<body>');
    expect(indexContent).toContain('<div id="root">');
    
    // Check for asset references
    expect(indexContent).toContain('.css');
    expect(indexContent).toContain('.js');
    
    // Ensure no template variables remain
    expect(indexContent).not.toContain('%VITE_');
    expect(indexContent).not.toContain('{{');
  });

  test('should generate proper asset files', async () => {
    // Run build first
    await execAsync('npm run build', {
      cwd: process.cwd(),
      timeout: 120000
    });

    // Use imported fs and path modules
    
    const distPath = path.join(process.cwd(), 'dist');
    const assetsPath = path.join(distPath, 'assets');
    
    // Check dist directory exists
    expect(fs.existsSync(distPath)).toBe(true);
    expect(fs.existsSync(assetsPath)).toBe(true);
    
    // Check for CSS and JS files
    const assetFiles = fs.readdirSync(assetsPath);
    
    const hasCssFile = assetFiles.some((file: string) => file.endsWith('.css'));
    const hasJsFile = assetFiles.some((file: string) => file.endsWith('.js'));
    
    expect(hasCssFile).toBe(true);
    expect(hasJsFile).toBe(true);
    
    // Verify file sizes are reasonable (not empty)
    assetFiles.forEach((file: string) => {
      const filePath = path.join(assetsPath, file);
      const stats = fs.statSync(filePath);
      expect(stats.size).toBeGreaterThan(0);
    });
  });
});