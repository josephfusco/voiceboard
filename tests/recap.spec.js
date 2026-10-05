import { test, expect } from './fixtures.js';

const ping = (page) => page.waitForResponse((r) => r.url().includes('/voiceboard/v1/ping'));

test.describe('recap (plugin)', () => {
	test.skip(({ boardPath }) => boardPath === '/', 'needs the WordPress plugin');

	const play = async (page, boardPath, code) => {
		const base = `${boardPath}?g=trivia&code=${code}&t=Space&q=Which+planet+has+rings%3F&c=Mars|Saturn`;
		await Promise.all([ping(page), page.goto(`${base}&st=ask&p=Joe:0,Sam:0`)]);
		await Promise.all([ping(page), page.goto(`${base}&st=reveal&a=B&r=Sam&add=Sam:100`)]);
		await Promise.all([ping(page), page.goto(`${boardPath}?g=trivia&code=${code}&t=Space&st=end`)]);
	};

	test('the final screen shows a QR code that opens the recap', async ({ page, boardPath }) => {
		const code = `qr-${Date.now()}`;
		await play(page, boardPath, code);
		await expect(page.locator('img.recap-qr')).toBeVisible();
		await page.goto(`${boardPath}journey/${code}`);
		await expect(page.locator('h1')).toHaveText('Space');
		await expect(page.locator('.standings li').first()).toHaveText('Sam100');
		await expect(page.locator('.moments li')).toHaveText(['Which planet has rings? -> Saturn (Sam)']);
	});

	test('the recap can be emailed, and the spam trap blocks bots', async ({ page, boardPath }) => {
		const code = `mail-${Date.now()}`;
		await play(page, boardPath, code);
		await page.goto(`${boardPath}journey/${code}`);
		await page.fill('#recap-email', 'player@example.com');
		await page.click('button[type=submit]');
		await expect(page.locator('.status')).toHaveText('Sent. Check your inbox.');

		await page.evaluate(() => { document.querySelector('[name=website]').value = 'bot'; });
		await page.fill('#recap-email', 'player@example.com');
		await page.click('button[type=submit]');
		await expect(page.locator('.status')).toHaveClass(/error/);
	});

	test('unknown recap codes are a 404', async ({ request, boardPath }) => {
		expect((await request.get(`${boardPath}journey/nope-${Date.now()}`)).status()).toBe(404);
	});
});

test('static hosting shows no recap QR', async ({ open, page, baseURL }) => {
	test.skip(!baseURL.includes('8766'), 'static only');
	await open('g=trivia&st=end&code=abc&p=Joe:1');
	await expect(page.locator('img.recap-qr')).toHaveCount(0);
});
