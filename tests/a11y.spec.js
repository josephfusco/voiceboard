import AxeBuilder from '@axe-core/playwright';
import { readFileSync } from 'node:fs';
import { test, expect } from './fixtures.js';

const SCREENS = {
	home: 'g=home',
	trivia: 'g=trivia&st=reveal&q=Which+planet%3F&c=Jupiter|Saturn&a=B&r=Sam&p=Joe:1,Sam:2&timer=10',
	board: 'g=jeopardy&cats=Space|Rivers|Food&u=A1&at=B2&p=Joe:1',
	scores: 'g=trivia&st=end&p=Joe:1,Sam:2',
};

test.describe('accessibility (axe)', () => {
	for (const theme of ['classic', 'cyber']) {
		for (const [name, query] of Object.entries(SCREENS)) {
			test(`${name} in ${theme} has no violations`, async ({ open, page }) => {
				await open(`${query}&theme=${theme}`);
				// Zoom is disabled on purpose so the board behaves like an in-car app; its type is already large and screen-sized.
				const { violations } = await new AxeBuilder({ page }).include('body').disableRules(['meta-viewport']).analyze();
				expect(violations.map((v) => `${v.id}: ${v.nodes.length}`)).toEqual([]);
			});
		}
	}
});

// Text contrast meets WCAG AAA (7:1, or 4.5:1 for large text) on every example screen, in every look,
// so the board stays readable from the back seat and in sunlight.
const examples = JSON.parse(readFileSync(new URL('../docs/examples.json', import.meta.url), 'utf8'));
const LOOKS = [['classic', 'light'], ['classic', 'dark'], ['cyber', 'dark']];

test.describe('contrast (AAA)', () => {
	for (const [theme, colorScheme] of LOOKS) {
		test(`every example in ${theme} ${colorScheme}`, async ({ open, page }) => {
			test.setTimeout(120_000);
			await page.emulateMedia({ colorScheme });
			const failures = [];
			for (const example of examples) {
				const query = example.query.replace(/^\?/, '').replace(/&?theme=\w+/, '');
				await open(`${query}${query ? '&' : ''}theme=${theme}`);
				await page.waitForTimeout(250);
				const { violations } = await new AxeBuilder({ page }).include('body').withRules(['color-contrast', 'color-contrast-enhanced']).analyze();
				for (const v of violations) for (const node of v.nodes) failures.push(`${example.title}: ${node.target.join(' ')} — ${node.any[0]?.message ?? v.id}`);
			}
			expect(failures).toEqual([]);
		});
	}
});
