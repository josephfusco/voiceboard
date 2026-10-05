import { test, expect } from '../../../tests/fixtures.js';

// The test site installs the Presence API plugin and a small test-only route that lists a room's clients.
const room = async (request, name) => (await (await request.get('/wp-json/voiceboard-test/v1/presence', { params: { room: name } })).json());
const post = (request, path, data) => request.post(`/wp-json/voiceboard/v1/${path}`, { data });

test.describe('presence', () => {
	test.skip(({ boardPath }) => boardPath !== '/board/', 'needs the WordPress plugin and the Presence API');

	test('a board joins its session room and the all-boards room, and leaves on close', async ({ request }) => {
		const code = `presence-${Date.now()}`;
		const car = `car${Date.now()}`;
		await post(request, 'ping', { car, code, query: `g=trivia&code=${code}&q=Hi`, state: { app: 'trivia', screen: 'ask' } });
		expect(await room(request, `voiceboard/session/${code}`)).toContain(`voiceboard-${car}`);
		expect(await room(request, 'voiceboard/cars')).toContain(`voiceboard-${car}`);

		await post(request, 'bye', { car, code });
		expect(await room(request, `voiceboard/session/${code}`)).not.toContain(`voiceboard-${car}`);
	});

	test('plain browsing joins only the all-boards room', async ({ request }) => {
		const car = `browse${Date.now()}`;
		await post(request, 'ping', { car, query: 'g=home', state: { app: 'home', screen: 'home' } });
		expect(await room(request, 'voiceboard/cars')).toContain(`voiceboard-${car}`);
		expect(await room(request, `voiceboard/session/car-${car}`)).toEqual([]);
	});

	test('a board that tries to take over another session never enters its room', async ({ request }) => {
		const code = `owned-${Date.now()}`;
		await post(request, 'ping', { car: 'ownercar99', code, query: `g=trivia&code=${code}&q=Hi`, state: {} });
		await post(request, 'ping', { car: 'intruder99', code, query: `g=trivia&code=${code}&q=Hi`, state: {} });
		expect(await room(request, `voiceboard/session/${code}`)).not.toContain('voiceboard-intruder99');
	});
});
