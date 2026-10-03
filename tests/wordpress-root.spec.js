import { test, expect } from './fixtures.js';

// Board at the site root (Settings → Reading → blank path), with the site theme active.
test.describe('wordpress, board at the root', () => {
	test('the root serves the board and does not redirect', async ({ open, page }) => {
		await open('g=trivia&q=Root');
		await expect(page).toHaveURL(/^http:\/\/127\.0\.0\.1:9401\/\?/);
		await expect(page.locator('h1')).toHaveText('Root');
	});

	test('llms.txt points at the root', async ({ request, baseURL }) => {
		expect(await (await request.get('/llms.txt')).text()).toContain(`Board URL: ${baseURL}/\n`);
	});

	test('WordPress URLs at the root still reach WordPress', async ({ request }) => {
		const html = await (await request.get('/?p=1')).text();
		expect(html).not.toContain('id="dock"');
		expect(html).toContain('Hello world!');
	});

	test('the site theme styles regular pages', async ({ page }) => {
		await page.goto('/sample-page/');
		const font = await page.evaluate(() => getComputedStyle(document.body).fontFamily);
		expect(font).toContain('system-ui');
		await expect(page.locator('header .wp-block-site-title').first()).toHaveCSS('text-transform', 'uppercase');
	});
});
