import { test, expect } from './fixtures.js';

// Every Tesla screen size (HW3 and HW4), plus a smaller browser window: no screen may scroll.
const SIZES = { 'Model 3 / Y (15")': [1920, 1200], 'Model S / X (17")': [2200, 1300], Cybertruck: [2400, 1350], 'Model S / X portrait': [1200, 1920], 'browser window': [1600, 900] };
const SCREENS = {
	home: 'g=home',
	question: 'g=trivia&st=ask&t=Space&n=3&of=10&q=Which+planet+has+the+most+known+moons+in+our+solar+system%3F&c=Jupiter|Saturn|Uranus|Neptune&p=A:1,B:2,C:3,D:4,E:5,F:6&timer=15',
	board: 'g=jeopardy&cats=Space|Rivers|80s+Movies|Food|Sports|Words&p=A:1,B:2,C:3,D:4,E:5,F:6',
	finale: 'g=trivia&st=end&p=A:1,B:2,C:3,D:4,E:5,F:6',
	chess: 'g=chess&p=Joe:0,Sam:0&mv=e4+e5+Nf3+Nc6',
	next: 'g=trivia&st=next&up=Joe&p=Joe:0,Sam:0',
};

for (const [label, [width, height]] of Object.entries(SIZES)) {
	test(`no scrolling on ${label}`, async ({ open, page }) => {
		await page.setViewportSize({ width, height });
		for (const [name, query] of Object.entries(SCREENS)) {
			await open(query);
			const overflow = await page.evaluate(() => [document.documentElement.scrollWidth - innerWidth, document.documentElement.scrollHeight - innerHeight]);
			expect(overflow, name).toEqual([0, 0]);
		}
	});
}

test('nothing scrolls before the board renders', async ({ page, boardPath }) => {
	await page.route('**/js/main.js*', (route) => route.abort());
	await page.goto(boardPath);
	const overflow = await page.evaluate(() => [document.documentElement.scrollWidth - innerWidth, document.documentElement.scrollHeight - innerHeight]);
	expect(overflow).toEqual([0, 0]);
});
