import { test as base, expect } from '@playwright/test';

// `open(query)` loads the board with a query string (string or object) and fails the test on any JS error.
export const test = base.extend({
	boardPath: ['/', { option: true }],
	open: async ({ page, boardPath }, use) => {
		const errors = [];
		page.on('pageerror', (error) => errors.push(error.message));
		page.on('console', (msg) => msg.type() === 'error' && errors.push(msg.text()));

		await use(async (query = '') => {
			const search = typeof query === 'string' ? query : new URLSearchParams(query).toString();
			await page.goto(`${boardPath}${search ? `?${search}` : ''}`);
			await expect(page.locator('#board.board')).toBeVisible();
			return page;
		});

		expect(errors).toEqual([]);
	},
});

export { expect };
