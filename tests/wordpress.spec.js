import { test, expect } from './fixtures.js';

// Plugin-only routes: instructions with this site's URL, and the home page redirect.
test.describe('wordpress plugin', () => {
	test.skip(({ boardPath }) => boardPath === '/', 'needs the WordPress plugin');

	test('llms.txt is served with the absolute board URL filled in', async ({ request, baseURL }) => {
		const response = await request.get('/llms.txt');
		expect(response.headers()['content-type']).toContain('text/plain');
		const text = await response.text();
		expect(text).toContain(`Board URL: ${baseURL}/board/`);
		expect(text).not.toContain('{board}');
	});

	test('/rules gives assistants the instructions and browsers the board', async ({ request, page, baseURL }) => {
		const response = await request.get('/rules', { headers: { Accept: '*/*' } });
		expect(response.headers()['content-type']).toContain('text/plain');
		expect(await response.text()).toContain(`Board URL: ${baseURL}/board/`);
		await page.goto('/rules');
		await expect(page).toHaveURL(/\/board\/$/);
		await expect(page.locator('#board')).toHaveClass(/app-home/);
	});

	test('the board page embeds the full instructions for no-JS readers', async ({ request, baseURL }) => {
		const html = await (await request.get('/board/')).text();
		expect(html).toContain(`Board URL: ${baseURL}/board/`);
		expect(html).toContain('g=trivia&amp;code=blue-otter&amp;st=ask');
	});

	test('the home page redirects to the board', async ({ page }) => {
		await page.goto('/');
		await expect(page).toHaveURL(/\/board\/$/);
		await expect(page.locator('#board')).toHaveClass(/app-home/);
	});

	test('the redirect keeps board params, including | and apostrophes', async ({ page }) => {
		await page.goto("/?g=trivia&q=What's+the+capital%3F&c=Paris|Rome");
		await expect(page).toHaveURL(/\/board\/\?g=trivia/);
		await expect(page.locator('h1')).toHaveText("What's the capital?");
		await expect(page.locator('.choice')).toHaveText(['AParis', 'BRome']);
	});
});

test.describe('wordpress plugin: home redirect leaves WordPress URLs alone', () => {
	test.skip(({ boardPath }) => boardPath === '/', 'needs the WordPress plugin');

	for (const query of ['p=1', 's=hello', 'page_id=2']) {
		test(`/?${query} is not redirected`, async ({ request }) => {
			const response = await request.get(`/?${query}`, { maxRedirects: 0 });
			expect(response.headers().location ?? '').not.toContain('/board/');
		});
	}
});

test.describe('wordpress plugin: the rest of the site is untouched', () => {
	test.skip(({ boardPath }) => boardPath === '/', 'needs the WordPress plugin');

	test('board HTML is cacheable', async ({ request }) => {
		const response = await request.get('/board/');
		expect(response.headers()['cache-control']).toContain('public');
	});

	test('pages, 404s, REST, and login behave normally', async ({ request }) => {
		const page = await request.get('/sample-page/');
		expect(page.status()).toBe(200);
		expect(await page.text()).not.toContain('id="dock"');
		expect((await request.get('/no-such-page/')).status()).toBe(404);
		expect((await request.get('/wp-json/')).status()).toBe(200);
		expect((await request.get('/wp-login.php')).status()).toBe(200);
	});
});
