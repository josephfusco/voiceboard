import { test, expect } from './fixtures.js';

const CATS = 'Space|Rivers|80s Movies|Food|Sports|Words';

test.describe('categories (jeopardy)', () => {
	test('board lays out categories and values, blanks used clues, marks the current one', async ({ open }) => {
		const page = await open({ g: 'jeopardy', st: 'board', cats: CATS, u: 'A1,C3', at: 'D4' });
		await expect(page.locator('#board')).toHaveClass(/app-categories state-board/);
		await expect(page.locator('.grid-cat')).toHaveText(CATS.split('|'));
		await expect(page.locator('.grid-cell')).toHaveCount(30);
		await expect(page.locator('.grid-cell.is-used')).toHaveCount(2);
		await expect(page.locator('.grid-cell').first()).toHaveText('');
		await expect(page.locator('.grid-cell.is-current')).toHaveText('$800');
	});

	test('custom values replace the defaults', async ({ open }) => {
		const page = await open({ g: 'jeopardy', cats: 'A|B', v: '100|200|300' });
		await expect(page.locator('.grid-cell')).toHaveCount(6);
		await expect(page.locator('.grid-cell').first()).toHaveText('$100');
	});

	test('clue shows category and value, daily double, and hides the answer', async ({ open }) => {
		const page = await open({ g: 'jeopardy', st: 'clue', cats: CATS, at: 'B3', q: 'This river flows through Cairo', a: 'What is the Nile?', dd: '1' });
		await expect(page.locator('.bar')).toContainText('Rivers · $600');
		await expect(page.locator('.eyebrow')).toHaveText('Daily Double');
		await expect(page.locator('.is-correct')).toHaveCount(0);
	});

	test('reveal shows the response and who got it', async ({ open }) => {
		const page = await open({ g: 'jeopardy', st: 'reveal', cats: CATS, at: 'B3', q: 'This river flows through Cairo', a: 'What is the Nile?', r: 'Ava' });
		await expect(page.locator('.is-correct')).toHaveText('What is the Nile?');
		await expect(page.locator('.verdict')).toHaveText('Ava got it!');
	});

	test('final reveal lists wagers', async ({ open }) => {
		const page = await open({ g: 'jeopardy', st: 'final', q: 'Final clue', a: 'What is Mars?', w: 'Joe:500,Sam:1200' });
		await expect(page.locator('.bar')).toContainText('Final round');
		await expect(page.locator('.wagers')).toHaveText('Joe wagered 500 · Sam wagered 1200');
	});

	test('negative scores are kept', async ({ open }) => {
		const page = await open({ g: 'jeopardy', cats: CATS, p: 'Joe:-400,Sam:200' });
		await expect(page.locator('.chip').first()).toHaveText('Joe-400');
	});
});

test.describe('categories: edge cases', () => {
	test('aliases and case: g=board, g=categories, g=JEOPARDY', async ({ open, page }) => {
		for (const g of ['board', 'categories', 'JEOPARDY']) {
			await open({ g, cats: 'A|B' });
			await expect(page.locator('#board')).toHaveClass(/app-categories state-board/);
		}
	});

	test('messy input: lowercase cells, junk values, too many categories', async ({ open, page }) => {
		await open({ g: 'jeopardy', cats: '1|2|3|4|5|6|7', u: 'a1 | c3, z9', at: 'Q1', v: 'abc' });
		await expect(page.locator('.grid-cat')).toHaveCount(6);
		await expect(page.locator('.grid-cell.is-used')).toHaveCount(2);
		await expect(page.locator('.grid-cell.is-current')).toHaveCount(0);
		await expect(page.locator('.grid-cell').nth(1)).toHaveText('$200');
	});

	test('st is inferred: clue, reveal, idle', async ({ open, page }) => {
		await open({ g: 'jeopardy', q: 'Clue' });
		await expect(page.locator('#board')).toHaveClass(/state-clue/);
		await open({ g: 'jeopardy', q: 'Clue', a: 'What is X?' });
		await expect(page.locator('#board')).toHaveClass(/state-reveal/);
		await open({ g: 'jeopardy', reset: '1' });
		await expect(page.locator('#board')).toHaveClass(/state-idle/);
	});

	test('the daily double banner is hidden once revealed', async ({ open, page }) => {
		await open({ g: 'jeopardy', st: 'reveal', q: 'Clue', a: 'What is X?', dd: '1' });
		await expect(page.locator('.eyebrow')).toHaveCount(0);
	});
});
