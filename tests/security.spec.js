import { test, expect } from './fixtures.js';

test.describe('core: security headers', () => {
	test.skip(({ boardPath }) => boardPath === '/', 'needs the WordPress plugin');

	test('the board sends a strict content security policy and still runs', async ({ open, page, request, boardPath }) => {
		const headers = (await request.get(boardPath)).headers();
		expect(headers['content-security-policy']).toContain("script-src 'self'");
		expect(headers['content-security-policy']).toContain("connect-src 'self'");
		expect(headers['x-content-type-options']).toBe('nosniff');
		await open('g=trivia&q=Under+CSP&p=Joe:1&fx=confetti&timer=5');
		await expect(page.locator('h1')).toHaveText('Under CSP');
	});
});
