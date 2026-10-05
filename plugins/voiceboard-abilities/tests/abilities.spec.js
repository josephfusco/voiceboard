import { test, expect } from '../../../tests/fixtures.js';

// Read-only abilities run over the Abilities API's REST routes (core since WordPress 6.9).
test.describe('abilities', () => {
	test.skip(({ boardPath }) => boardPath === '/', 'needs the WordPress plugin');
	const run = (request, name, input) => request.get(`/wp-json/wp-abilities/v1/abilities/voiceboard/${name}/run`, { params: input ? { 'input[g]': input.g, 'input[q]': input.q } : {} });

	test('build-url turns parameters into a board URL', async ({ request, baseURL }) => {
		const response = await run(request, 'build-url', { g: 'trivia', q: 'Hi there?' });
		expect(response.status()).toBe(200);
		expect(await response.json()).toBe(`${baseURL}/board/?g=trivia&q=Hi%20there%3F`);
	});

	test('get-instructions returns the assistant instructions with this site filled in', async ({ request, baseURL }) => {
		const text = await (await run(request, 'get-instructions')).json();
		expect(text).toContain(`Board URL: ${baseURL}/board/`);
		expect(text).toContain('## Chess (g=chess)');
	});

	test('get-transcript needs a logged-in user', async ({ request }) => {
		const response = await request.get('/wp-json/wp-abilities/v1/abilities/voiceboard/get-transcript/run', { params: { 'input[code]': 'x' } });
		expect(response.status()).toBe(401);
	});
});
