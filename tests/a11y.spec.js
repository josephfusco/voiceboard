import AxeBuilder from '@axe-core/playwright';
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
