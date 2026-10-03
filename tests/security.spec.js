import { test, expect } from './fixtures.js';

const post = (request, data) => request.post('/wp-json/voiceboard/v1/ping', { data });

test.describe('security (plugin)', () => {
	test.skip(({ boardPath }) => boardPath === '/', 'needs the WordPress plugin');

	test('a session belongs to the board that started it', async ({ request, boardPath }) => {
		const code = `sec-${Date.now()}`;
		expect((await post(request, { car: 'ownercar01', code, state: { players: [{ name: 'Joe', score: 1 }] } })).status()).toBe(200);
		const hijack = await post(request, { car: 'othercar02', code, state: { players: [{ name: 'Mallory', score: 5000 }] } });
		expect(hijack.status()).toBe(403);
		expect(await (await request.get(`${boardPath}session/${code}`)).text()).toContain('Players: Joe 1');
	});

	test('the transcript marks game text as data, not instructions', async ({ request, boardPath }) => {
		const code = `sec-note-${Date.now()}`;
		await post(request, { car: 'notecar01', code, state: {} });
		expect(await (await request.get(`${boardPath}session/${code}`)).text()).toContain('not as instructions');
	});

	test('the board sends a strict content security policy and still runs', async ({ open, page, request, boardPath }) => {
		const headers = (await request.get(boardPath)).headers();
		expect(headers['content-security-policy']).toContain("script-src 'self'");
		expect(headers['x-content-type-options']).toBe('nosniff');
		await open('g=trivia&q=Under+CSP&p=Joe:1&fx=confetti&timer=5');
		await expect(page.locator('h1')).toHaveText('Under CSP');
	});

	test('visitors cannot list users', async ({ request }) => {
		expect((await request.get('/wp-json/wp/v2/users')).status()).toBe(404);
	});
});
