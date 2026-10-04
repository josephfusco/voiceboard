import { test, expect } from './fixtures.js';
import { VOICE_SCRIPT, mockAssistant } from './scripts/chess-game.js';

// End to end: a full game driven only by a voice script and a mock assistant that turns speech into URLs.
test('a whole chess game, from the voice script to checkmate', async ({ open, page }) => {
	const assistant = mockAssistant(`e2e-${Date.now()}`);
	const expectAfter = {
		1: { status: 'White to move', square: 'e1: white king' },
		2: { status: 'Black to move', square: 'e4: white pawn' },
		10: { status: 'Black to move', square: 'e5: white knight' },
		11: { status: 'White to move', square: 'd1: black bishop' },
		12: { status: 'Check!', square: 'f7: white bishop' },
		14: { status: 'Checkmate. Joe wins!', square: 'd5: white knight' },
	};

	for (const [index, line] of VOICE_SCRIPT.entries()) {
		await open(assistant(line).slice(1));
		await expect(page.locator('.chess-illegal'), `"${line.says}" was not understood`).toHaveCount(0);
		const expected = expectAfter[index + 1];
		if (expected) {
			await expect(page.locator('.chess-status')).toHaveText(expected.status);
			await expect(page.getByRole('gridcell', { name: expected.square })).toBeVisible();
		}
	}
	await expect(page.locator('.chess-moves')).toContainText('7. Nd5#');
});

test('spoken moves that two pieces could make are flagged', async ({ open, page }) => {
	await open('g=chess&mv=pawn to d4,pawn to d5,knight to f3,knight to f6,knight to d2,pawn to e6,knight to f3');
	await expect(page.locator('.chess-illegal')).toHaveText('Not a legal move: knight to d2');
});
