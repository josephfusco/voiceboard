import { test, expect } from './fixtures.js';

// Voice assistants and launchers produce messy URLs; the board should shrug them off.
test.describe('robustness', () => {
	for (const [label, q] of [['single', 'moons%3F'], ['double', 'moons%253F'], ['triple', 'moons%25253F']]) {
		test(`${label}-encoded values decode`, async ({ open }) => {
			const page = await open(`g=trivia&q=${q}`);
			await expect(page.locator('h1')).toHaveText('moons?');
		});
	}

	test('literal percent signs survive', async ({ open }) => {
		const page = await open('g=trivia&q=50%25+off+or+100%+sure');
		await expect(page.locator('h1')).toHaveText('50% off or 100% sure');
	});

	test('bad scores become 0, blank names are dropped, max 6 players', async ({ open }) => {
		const page = await open('g=trivia&st=score&p=A:x,,B:1,C:2,D:3,E:4,F:5,G:6');
		await expect(page.locator('.score-row')).toHaveCount(6);
		await expect(page.locator('.score-row', { hasText: 'A' })).toHaveText('A0');
	});

	test('choice list trims blanks', async ({ open }) => {
		const page = await open('g=trivia&q=Hi&c=+A+||B+');
		await expect(page.locator('.choice')).toHaveText(['AA', 'BB']);
	});

	test('text is rendered as text, never HTML', async ({ open }) => {
		const page = await open({ g: 'trivia', q: '<img src=x onerror=alert(1)>' });
		await expect(page.locator('h1')).toHaveText('<img src=x onerror=alert(1)>');
		await expect(page.locator('#board img')).toHaveCount(0);
	});
});
