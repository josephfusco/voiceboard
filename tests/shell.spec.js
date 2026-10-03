import { test, expect } from './fixtures.js';

test.describe('shell', () => {
	test('no params opens home with every game as a tile', async ({ open }) => {
		const page = await open();
		await expect(page.locator('#board')).toHaveClass(/app-home/);
		await expect(page.getByRole('heading', { name: 'What should we play?' })).toBeVisible();
		await expect(page.locator('.tile strong')).toHaveText(['Trivia', 'Categories']);
	});

	test('unknown game falls back to home', async ({ open }) => {
		const page = await open('g=nope');
		await expect(page.locator('#board')).toHaveClass(/app-home/);
	});

	test('sidebar shows a clock, the apps, and marks the active one', async ({ open }) => {
		const page = await open('g=trivia');
		await expect(page.locator('.dock-clock')).toHaveText(/^\d{1,2}:\d{2}$/);
		await expect(page.locator('.dock-item')).toHaveCount(4);
		await expect(page.locator('.dock-item.is-active')).toHaveAttribute('aria-label', 'Trivia');
	});

	test('sidebar links navigate between apps on the same page', async ({ open, boardPath }) => {
		const page = await open('g=trivia');
		await page.getByRole('link', { name: 'Categories' }).click();
		await expect(page).toHaveURL(`${boardPath}?g=categories`);
		await page.getByRole('link', { name: 'Home' }).click();
		await expect(page.locator('#board')).toHaveClass(/app-home/);
	});

	test('home tiles open the game idle screen with its voice phrase', async ({ open }) => {
		const page = await open();
		await page.locator('.tile', { hasText: 'Trivia' }).click();
		await expect(page.locator('#board')).toHaveClass(/state-idle/);
		await expect(page.getByText("Let's play trivia")).toBeVisible();
	});

	test('assistant instructions are in the HTML but not shown once rendered', async ({ open, request, boardPath }) => {
		const html = await (await request.get(boardPath)).text();
		expect(html).toContain('How to host games on Voiceboard');
		const page = await open();
		await expect(page.getByText('How to host games on Voiceboard')).toHaveCount(0);
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
