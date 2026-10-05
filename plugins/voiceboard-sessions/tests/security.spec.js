import { test, expect } from '../../../tests/fixtures.js';

const post = (request, data) => request.post('/wp-json/voiceboard/v1/ping', { data });

test.describe('sessions: security', () => {
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
});

test.describe('sessions skip plain browsing', () => {
	test.skip(({ boardPath }) => boardPath === '/', 'needs the WordPress plugin');

	test('a home visit without a code creates no session', async ({ request, boardPath }) => {
		const car = `browse${Date.now()}`;
		const response = await post(request, { car, query: 'g=home', state: { app: 'home', screen: 'home' } });
		expect(await response.json()).toEqual({ session: null });
		expect((await request.get(`${boardPath}session/car-${car}`)).status()).toBe(404);
	});
});
