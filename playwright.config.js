import { defineConfig, devices } from '@playwright/test';

// The Tesla browser is Chromium; the viewport matches its center screen.
const use = { ...devices['Desktop Chrome'], viewport: { width: 1920, height: 1200 } };

export default defineConfig({
	// Core tests live in tests/; each module keeps its own in plugins/<name>/tests/.
	testDir: '.',
	testMatch: ['tests/**/*.spec.js', 'plugins/*/tests/**/*.spec.js'],
	fullyParallel: true,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 1 : 0,
	reporter: process.env.CI ? 'github' : 'list',
	projects: [
		// Plain static hosting: the board lives at the site root.
		{ name: 'static', testIgnore: /wordpress-root/, use: { ...use, baseURL: 'http://127.0.0.1:8766', boardPath: '/' } },
		// The same suite through the WordPress plugin at /board/.
		{ name: 'wordpress', testIgnore: /wordpress-root/, use: { ...use, baseURL: 'http://127.0.0.1:9400', boardPath: '/board/' } },
		// Plugin with the board at the site root and the site theme active.
		{ name: 'wordpress-root', testMatch: /wordpress-root/, use: { ...use, baseURL: 'http://127.0.0.1:9401', boardPath: '/' } },
	],
	webServer: [
		{ command: 'npm run serve', url: 'http://127.0.0.1:8766', reuseExistingServer: !process.env.CI },
		{ command: 'npm run wp', url: 'http://127.0.0.1:9400/board/', reuseExistingServer: !process.env.CI, timeout: 240_000 },
		{ command: 'npm run wp:root', url: 'http://127.0.0.1:9401/llms.txt', reuseExistingServer: !process.env.CI, timeout: 240_000 },
	],
});
