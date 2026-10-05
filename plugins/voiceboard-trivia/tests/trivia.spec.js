import { test, expect } from '../../../tests/fixtures.js';

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

test.describe('trivia: edge cases', () => {
	test('an answer outside the choices shows the answer instead of dimming everything', async ({ open, page }) => {
		await open({ ...QUESTION, st: 'reveal', a: 'E' });
		await expect(page.locator('.choice.is-dim')).toHaveCount(0);
		await expect(page.locator('.is-correct')).toHaveText('E');
		await open({ ...QUESTION, st: 'reveal', a: 'Pluto' });
		await expect(page.locator('.is-correct')).toHaveText('Pluto');
	});

	test('choice layouts: 3 stack, up to 6 are lettered, extras dropped', async ({ open, page }) => {
		await open({ g: 'trivia', q: 'Q', c: 'a|b|c' });
		await expect(page.locator('.choices')).toHaveClass(/count-3/);
		await open({ g: 'trivia', q: 'Q', c: '1|2|3|4|5|6|7' });
		await expect(page.locator('.choice .muted')).toHaveText(['A', 'B', 'C', 'D', 'E', 'F']);
	});

	test('explicit st=score wins over a question; end with nobody is game over', async ({ open, page }) => {
		await open({ ...QUESTION, st: 'score' });
		await expect(page.locator('h1')).toHaveText('Scoreboard');
		await open('g=trivia&st=end&reset=1');
		await expect(page.locator('h1')).toHaveText('Game over');
	});
});

test.describe('turns', () => {
	test('st=next names the player, highlights them, and asks for ready', async ({ open, page }) => {
		await open('g=trivia&st=next&up=Joe&p=Joe:0,Sam:100');
		await expect(page.locator('.eyebrow')).toHaveText('Next up');
		await expect(page.locator('h1')).toHaveText('Joe');
		await expect(page.getByText('Say “ready” to start')).toBeVisible();
		await expect(page.locator('.chip.is-up')).toHaveText('Joe0');
		await expect(page.getByRole('timer')).toHaveCount(0);
	});

	test('the ask screen after ready shows the question and starts the timer together', async ({ open, page }) => {
		await open('g=trivia&st=ask&up=joe&q=Ready+question&c=A|B&timer=15&p=Joe:0');
		await expect(page.locator('h1')).toHaveText('Ready question');
		await expect(page.getByRole('timer')).toHaveText('15');
		await expect(page.locator('.chip.is-up')).toHaveCount(1);
	});

	test('next works in Jeopardy and in other languages', async ({ open, page }) => {
		await open('g=jeopardy&st=next&up=Ana&lang=es&p=Ana:0');
		await expect(page.locator('.eyebrow')).toHaveText('Siguiente turno');
	});
});

test('the final screen ends with a small credit linking to the maker', async ({ open, page }) => {
	await open('g=trivia&st=end&p=Joe:300,Sam:500');
	const credit = page.locator('a.credit');
	await expect(credit).toHaveText('Made by Joe Fusco');
	await expect(credit).toHaveAttribute('href', 'https://josephfus.co');
	await expect(credit).toHaveAttribute('target', '_blank');
	await open('g=trivia&st=score&p=Joe:300');
	await expect(page.locator('a.credit')).toHaveCount(0);
});
