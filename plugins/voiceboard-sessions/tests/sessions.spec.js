import { test, expect } from '../../../tests/fixtures.js';

const ping = (page) => page.waitForResponse((r) => r.url().includes('/voiceboard/v1/ping') && r.request().method() === 'POST');

test.describe('sessions (plugin)', () => {
	test.skip(({ boardPath }) => boardPath === '/', 'needs the WordPress plugin');

	test('each screen is recorded, and the transcript reads it back', async ({ page, boardPath, request }) => {
		const code = `test-${Date.now()}`;
		const base = `${boardPath}?g=trivia&code=${code}&t=Space&n=1&of=5&q=Which+planet+has+the+most+moons%3F&c=Jupiter|Saturn`;
		await Promise.all([ping(page), page.goto(`${base}&st=ask&p=Joe:0,Sam:0`)]);
		await Promise.all([ping(page), page.goto(`${base}&st=reveal&a=B&r=Sam&add=Sam:100`)]);

		const response = await request.get(`${boardPath}session/${code}`);
		expect(response.headers()['cache-control']).toContain('no-cache');
		const text = await response.text();
		expect(text).toContain(`Voiceboard session ${code}`);
		expect(text).toContain('Players: Sam 100, Joe 0');
		expect(text).toContain('Question 1 of 5');
		expect(text).toContain('1. Which planet has the most moons? -> Saturn (Sam)');
	});

	test('the report carries diagnostics for anything the board fixed or ignored', async ({ page, boardPath }) => {
		const [response] = await Promise.all([ping(page), page.goto(`${boardPath}?g=trivia&question=Hi&st=bogus&q=Real`)]);
		const body = response.request().postDataJSON();
		expect(body.diag).toEqual(expect.arrayContaining(['unknown param: question', 'asked for bogus, showed ask']));
		expect(body.car).toMatch(/^[a-z0-9]{8,16}$/);
	});

	test('unknown session codes are a 404', async ({ request, boardPath }) => {
		expect((await request.get(`${boardPath}session/nope-${Date.now()}`)).status()).toBe(404);
	});

	test('pings from other sites are refused', async ({ request }) => {
		const response = await request.post('/wp-json/voiceboard/v1/ping', { headers: { Origin: 'https://evil.example' }, data: { car: 'abcdefgh' } });
		expect(response.status()).toBeGreaterThanOrEqual(401);
	});
});

test('static hosting sends no reports', async ({ open, page, baseURL }) => {
	test.skip(!baseURL.includes('8766'), 'static only');
	const pings = [];
	page.on('request', (r) => r.url().includes('/voiceboard/v1/') && pings.push(r.url()));
	await open('g=trivia&q=Hi&code=abc');
	await page.waitForTimeout(300);
	expect(pings).toEqual([]);
});
