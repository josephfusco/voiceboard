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

	test('the sidebar holds only system controls, never other games', async ({ open }) => {
		const page = await open('g=chess');
		await expect(page.locator('.dock-clock')).toHaveText(/^\d{1,2}:\d{2}$/);
		await expect(page.locator('#dock a.dock-item')).toHaveCount(2);
		await expect(page.getByRole('link', { name: 'Hall of Fame' })).toBeVisible();
		await expect(page.getByRole('link', { name: 'Home' })).toBeVisible();
		await expect(page.getByRole('button', { name: 'More' })).toBeVisible();
		for (const game of ['Trivia', 'Categories', 'Chess', 'Adventure']) {
			await expect(page.locator('#dock').getByRole('link', { name: game })).toHaveCount(0);
		}
	});

	test('games launch from Home; the sidebar goes back Home', async ({ open, boardPath }) => {
		const page = await open('g=trivia');
		await page.getByRole('link', { name: 'Home' }).click();
		await expect(page.locator('#board')).toHaveClass(/app-home/);
		await page.locator('.tile', { hasText: 'Chess' }).click();
		await expect(page).toHaveURL(`${boardPath}?g=chess`);
		await expect(page.locator('.dock-item.is-active')).toHaveCount(0);
	});

	test('home tiles show what to say, using this site\'s own address', async ({ open, baseURL }) => {
		const page = await open();
		const host = new URL(baseURL).host;
		await expect(page.locator('.home-hint')).toHaveText(`Say “Read ${host}/rules, then …”`);
		await expect(page.locator('.tile-say').first()).toHaveText('“host trivia”');
		await page.locator('.tile', { hasText: 'Trivia' }).click();
		await expect(page.locator('#board')).toHaveClass(/state-idle/);
		await expect(page.getByText(`Say “Read ${host}/rules, then host trivia”`)).toBeVisible();
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

	test('the ⋮ menu switches theme without changing the game', async ({ open, page }) => {
		await open('g=trivia&q=Stay+put&p=Joe:100');
		await expect(page.locator('html')).toHaveAttribute('data-theme', 'classic');
		await page.getByRole('button', { name: 'More' }).click();
		await expect(page.getByRole('menuitemradio', { name: 'Classic' })).toHaveAttribute('aria-checked', 'true');
		await page.getByRole('menuitemradio', { name: 'Cyber' }).click();
		await expect(page.locator('html')).toHaveAttribute('data-theme', 'cyber');
		await expect(page.getByRole('menu')).toBeHidden();
		await expect(page.locator('h1')).toHaveText('Stay put');
		await expect(page.locator('.chip')).toHaveText(['Joe100']);
		await page.reload();
		await expect(page.locator('html')).toHaveAttribute('data-theme', 'cyber');
	});

	test('unknown theme falls back to classic', async ({ open, page }) => {
		await open('g=home&theme=nope');
		await expect(page.locator('html')).toHaveAttribute('data-theme', 'classic');
	});

	test('a saved theme that no longer exists falls back to classic', async ({ open, page }) => {
		await page.addInitScript(() => localStorage.setItem('voiceboard', JSON.stringify({ theme: 'retired' })));
		await open('g=home');
		await expect(page.locator('html')).toHaveAttribute('data-theme', 'classic');
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

	test('a theme= URL overrides the saved choice, and the menu shows the current theme', async ({ open, page }) => {
		await open('g=home&theme=cyber');
		await open('g=home&theme=classic');
		await expect(page.locator('html')).toHaveAttribute('data-theme', 'classic');
		await page.getByRole('button', { name: 'More' }).click();
		await expect(page.getByRole('menuitemradio', { name: 'Classic' })).toHaveAttribute('aria-checked', 'true');
		await expect(page.getByRole('menuitemradio', { name: 'Cyber' })).toHaveAttribute('aria-checked', 'false');
	});
});
