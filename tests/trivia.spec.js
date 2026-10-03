import { test, expect } from './fixtures.js';

const QUESTION = {
	g: 'trivia',
	t: 'Space',
	n: '3',
	of: '10',
	q: 'Which planet has the most known moons?',
	c: 'Jupiter|Saturn|Uranus|Neptune',
	p: 'Joe:200,Sam:100',
};

test.describe('trivia', () => {
	test('ask shows the question, lettered choices, progress, and scores', async ({ open }) => {
		const page = await open({ ...QUESTION, st: 'ask' });
		await expect(page.locator('h1')).toHaveText(QUESTION.q);
		await expect(page.locator('.choice')).toHaveText(['AJupiter', 'BSaturn', 'CUranus', 'DNeptune']);
		await expect(page.locator('.bar')).toContainText('Question 3 of 10');
		await expect(page.locator('.chip')).toHaveText(['Joe200', 'Sam100']);
		await expect(page).toHaveTitle(QUESTION.q);
	});

	for (const a of ['B', 'b', '2', 'Saturn', 'saturn']) {
		test(`reveal resolves a=${a} to Saturn`, async ({ open }) => {
			const page = await open({ ...QUESTION, st: 'reveal', a, r: 'Sam' });
			await expect(page.locator('.choice.is-correct')).toHaveText('BSaturn');
			await expect(page.locator('.choice.is-dim')).toHaveCount(3);
			await expect(page.locator('.verdict')).toHaveText('Sam got it!');
		});
	}

	test('r=none says nobody got it', async ({ open }) => {
		const page = await open({ ...QUESTION, st: 'reveal', a: 'B', r: 'none' });
		await expect(page.locator('.verdict')).toHaveText('Nobody got it');
	});

	test('open-ended reveal shows the answer itself', async ({ open }) => {
		const page = await open({ g: 'trivia', q: 'Who was the first person in space?', a: 'Yuri Gagarin' });
		await expect(page.locator('#board')).toHaveClass(/state-reveal/);
		await expect(page.locator('.choice.is-correct')).toHaveText('Yuri Gagarin');
	});

	test('params without g are a trivia game', async ({ open }) => {
		const page = await open({ q: 'Bare question?' });
		await expect(page.locator('#board')).toHaveClass(/app-trivia state-ask/);
	});

	test('st is inferred: no question shows scores, nothing shows idle', async ({ open }) => {
		await expect((await open('g=trivia&p=Joe:1')).locator('#board')).toHaveClass(/state-score/);
		await expect((await open('g=trivia&reset=1')).locator('#board')).toHaveClass(/state-idle/);
	});

	test('end names the winner, ranks players, and highlights the leader', async ({ open }) => {
		const page = await open('g=trivia&st=end&p=Joe:300,Sam:500,Ava:400');
		await expect(page.locator('h1')).toHaveText('Sam wins!');
		await expect(page.locator('.score-row')).toHaveText(['Sam500', 'Ava400', 'Joe300']);
		await expect(page.locator('.is-leader')).toHaveCount(1);
	});

	test('end with a shared top score is a tie', async ({ open }) => {
		const page = await open('g=trivia&st=end&p=Joe:500,Sam:500');
		await expect(page.locator('h1')).toHaveText("It's a tie!");
		await expect(page.locator('.is-leader')).toHaveCount(2);
	});
});
