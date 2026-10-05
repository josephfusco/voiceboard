import { test, expect } from './fixtures.js';

test.describe('shell', () => {
	test('no params opens home with every game as a tile', async ({ open }) => {
		const page = await open();
		await expect(page.locator('#board')).toHaveClass(/app-home/);
		await expect(page.getByRole('heading', { name: 'What should we play?' })).toBeVisible();
		await expect(page.locator('.tile strong')).toHaveText(['Trivia', 'Categories', 'Chess', 'Adventure']);
	});

	test('unknown game falls back to home', async ({ open }) => {
		const page = await open('g=nope');
		await expect(page.locator('#board')).toHaveClass(/app-home/);
	});

	test('sidebar shows a clock, the apps, and marks the active one', async ({ open }) => {
		const page = await open('g=trivia');
		await expect(page.locator('.dock-clock')).toHaveText(/^\d{1,2}:\d{2}$/);
		await expect(page.locator('a.dock-item')).toHaveCount(6);
		await expect(page.getByRole('button', { name: 'New game' })).toBeVisible();
		await expect(page.locator('.dock-item.is-active')).toHaveAttribute('aria-label', 'Trivia');
	});

	test('sidebar links navigate between apps on the same page', async ({ open, boardPath }) => {
		const page = await open('g=trivia');
		await page.getByRole('link', { name: 'Categories' }).click();
		await expect(page).toHaveURL(`${boardPath}?g=categories`);
		await page.getByRole('link', { name: 'Home' }).click();
		await expect(page.locator('#board')).toHaveClass(/app-home/);
	});

	test('home tiles show what to say, using this site\'s own address', async ({ open, baseURL }) => {
		const page = await open();
		const host = new URL(baseURL).host;
		await expect(page.locator('.home-hint')).toHaveText(`Say “Open ${host} and …”`);
		await expect(page.locator('.tile-say').first()).toHaveText('“host trivia”');
		await page.locator('.tile', { hasText: 'Trivia' }).click();
		await expect(page.locator('#board')).toHaveClass(/state-idle/);
		await expect(page.getByText(`Say “Open ${host} and host trivia”`)).toBeVisible();
	});

	test('assistant instructions are in the HTML but hidden once rendered', async ({ open, request, boardPath }) => {
		const html = await (await request.get(boardPath)).text();
		expect(html).toContain('llms.txt');
		const page = await open();
		await expect(page.locator('#board pre, #board a[href="llms.txt"]')).toHaveCount(0);
	});

	test('follows the system light/dark preference', async ({ open, page }) => {
		const background = () => page.evaluate(() => getComputedStyle(document.body).backgroundColor);
		await page.emulateMedia({ colorScheme: 'light' });
		await open();
		const light = await background();
		await page.emulateMedia({ colorScheme: 'dark' });
		expect(await background()).not.toBe(light);
	});
});

test.describe('themes', () => {
	test('theme=cyber applies and is remembered on the device', async ({ open, page }) => {
		await open('g=home&theme=cyber');
		await expect(page.locator('html')).toHaveAttribute('data-theme', 'cyber');
		await open('g=trivia&q=Next');
		await expect(page.locator('html')).toHaveAttribute('data-theme', 'cyber');
	});

	test('the sidebar toggle switches theme without changing the game', async ({ open, page }) => {
		await open('g=trivia&q=Stay+put&p=Joe:100');
		await expect(page.locator('html')).toHaveAttribute('data-theme', 'tesla');
		await page.getByRole('button', { name: 'Switch to Cyber theme' }).click();
		await expect(page.locator('html')).toHaveAttribute('data-theme', 'cyber');
		await expect(page.getByRole('button', { name: 'Switch to Tesla theme' })).toBeVisible();
		await expect(page.locator('h1')).toHaveText('Stay put');
		await expect(page.locator('.chip')).toHaveText(['Joe100']);
		await page.reload();
		await expect(page.locator('html')).toHaveAttribute('data-theme', 'cyber');
	});

	test('unknown theme falls back to tesla', async ({ open, page }) => {
		await open('g=home&theme=nope');
		await expect(page.locator('html')).toHaveAttribute('data-theme', 'tesla');
	});
});

test.describe('shell: time and theme details', () => {
	test('greeting follows the time of day', async ({ open, page }) => {
		await page.clock.setFixedTime(new Date('2026-10-03T08:00:00'));
		await open();
		await expect(page.locator('.bar-title')).toHaveText('Good morning');
		await page.clock.setFixedTime(new Date('2026-10-03T20:00:00'));
		await page.reload();
		await expect(page.locator('.bar-title')).toHaveText('Good evening');
	});

	test('a theme= URL overrides the saved choice, and the toggle cycles back', async ({ open, page }) => {
		await open('g=home&theme=cyber');
		await open('g=home&theme=tesla');
		await expect(page.locator('html')).toHaveAttribute('data-theme', 'tesla');
		await page.getByRole('button', { name: 'Switch to Cyber theme' }).click();
		await page.getByRole('button', { name: 'Switch to Tesla theme' }).click();
		await expect(page.locator('html')).toHaveAttribute('data-theme', 'tesla');
	});
});
