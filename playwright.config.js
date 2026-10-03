import { defineConfig, devices } from '@playwright/test';

// The Tesla browser is Chromium; the viewport matches its center screen.
const use = { ...devices['Desktop Chrome'], viewport: { width: 1920, height: 1200 } };

export default defineConfig({
	testDir: 'tests',
	fullyParallel: true,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 1 : 0,
	reporter: process.env.CI ? 'github' : 'list',
	projects: [
		// Plain static hosting: the board lives at the site root.
		{ name: 'static', use: { ...use, baseURL: 'http://127.0.0.1:8766', boardPath: '/' } },
		// The same suite through the WordPress plugin at /board/.
		{ name: 'wordpress', use: { ...use, baseURL: 'http://127.0.0.1:9400', boardPath: '/board/' } },
	],
	webServer: [
		{ command: 'npm run serve', url: 'http://127.0.0.1:8766', reuseExistingServer: !process.env.CI },
		{ command: 'npm run wp', url: 'http://127.0.0.1:9400/board/', reuseExistingServer: !process.env.CI, timeout: 240_000 },
	],
});
