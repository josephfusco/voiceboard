import { test, expect } from './fixtures.js';

test.describe('chess', () => {
	test('starts from the standard position with labeled squares', async ({ open, page }) => {
		await open('g=chess&p=Joe:0,Sam:0');
		await expect(page.locator('.sq')).toHaveCount(64);
		await expect(page.locator('.piece')).toHaveCount(32);
		await expect(page.getByRole('gridcell', { name: 'e1: white king' })).toBeVisible();
		await expect(page.locator('.chess-status')).toHaveText('White to move');
		await expect(page.locator('.chess-player.is-turn')).toHaveText('Joe');
	});

	test('replays mixed notation and highlights the last move', async ({ open, page }) => {
		await open('g=chess&mv=e2e4+e5+Nf3');
		await expect(page.getByRole('gridcell', { name: 'f3: white knight' })).toBeVisible();
		await expect(page.locator('.sq.last')).toHaveCount(2);
		await expect(page.locator('.chess-status')).toHaveText('Black to move');
		await expect(page.locator('.chess-moves')).toHaveText('1. e4 e5 2. Nf3');
	});

	test('checkmate names the winner', async ({ open, page }) => {
		await open('g=chess&p=Joe:0,Sam:0&mv=f3+e5+g4+Qh4');
		await expect(page.locator('.chess-status')).toHaveText('Checkmate. Sam wins!');
		await expect(page.locator('.sq.check')).toHaveCount(1);
	});

	test('an illegal move is flagged and ignored', async ({ open, page }) => {
		await open('g=chess&mv=e4+e5+Ke3+Nc6');
		await expect(page.locator('.chess-illegal')).toHaveText('Not a legal move: Ke3');
		await expect(page.getByRole('gridcell', { name: 'c6: empty' })).toBeVisible();
	});

	test('side=b flips the board; RTL does not mirror it', async ({ open, page }) => {
		await open('g=chess&side=b&lang=ar');
		const first = page.locator('.sq').first();
		await expect(first).toHaveAttribute('aria-label', 'h1: white rook');
		await expect(page.locator('.chess-board')).toHaveCSS('direction', 'ltr');
	});
});

test('chess puts the position and legal moves in the transcript', async ({ page, boardPath, request }) => {
	test.skip(boardPath === '/', 'needs the WordPress plugin');
	const code = `chess-${Date.now()}`;
	await Promise.all([
		page.waitForResponse((r) => r.url().includes('/voiceboard/v1/ping')),
		page.goto(`${boardPath}?g=chess&code=${code}&p=Joe:0,Sam:0&mv=e4+e5`),
	]);
	const text = await (await request.get(`${boardPath}session/${code}`)).text();
	expect(text).toContain('Board: Chess. Position (FEN): rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq');
	expect(text).toContain('Legal moves:');
});

test.describe('chess: tap to see moves', () => {
	test('one piece at a time, only for the side to move, and it changes nothing', async ({ open, page }) => {
		await open('g=chess&p=Joe:0,Sam:0');
		const cell = (square) => page.locator(`[data-square="${square}"]`);
		await cell('e2').click();
		await expect(page.locator('.sq.target')).toHaveCount(2);
		await expect(cell('e4')).toHaveClass(/target/);
		await cell('g1').click();
		await expect(page.locator('.sq.selected')).toHaveCount(1);
		await expect(page.locator('.sq.target')).toHaveCount(2);
		await expect(cell('f3')).toHaveClass(/target/);
		await cell('g1').click();
		await expect(page.locator('.sq.target')).toHaveCount(0);
		await cell('e7').click();
		await expect(page.locator('.sq.selected')).toHaveCount(0);
		await expect(page).toHaveURL(/g=chess&p=Joe:0,Sam:0$/);
	});
});
