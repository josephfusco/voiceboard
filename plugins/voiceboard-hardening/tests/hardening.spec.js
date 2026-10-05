import { test, expect } from '../../../tests/fixtures.js';

test.describe('hardening', () => {
	test.skip(({ boardPath }) => boardPath === '/', 'needs the WordPress plugin');

	test('visitors cannot list users', async ({ request }) => {
		expect((await request.get('/wp-json/wp/v2/users')).status()).toBe(404);
	});

	test('logged-out visitors still get the rest of the REST API', async ({ request }) => {
		expect((await request.get('/wp-json/')).status()).toBe(200);
		expect((await request.get('/wp-json/wp/v2/pages')).status()).toBe(200);
	});
});
