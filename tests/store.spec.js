import { test, expect } from './fixtures.js';

// Players and finished games persist in localStorage across URLs.
test.describe('remembered state', () => {
	test('roster carries over and add= adjusts scores', async ({ open, page }) => {
		await open('g=trivia&q=One&p=Joe:0,Sam:0');
		await open('g=trivia&q=Two&add=Sam:100');
		await open('g=trivia&q=Three&add=Joe:-50,Ava:200');
		await expect(page.locator('.chip')).toHaveText(['Joe-50', 'Sam100', 'Ava200']);
	});

	test('reloading the same URL does not apply add= twice', async ({ open, page }) => {
		await open('g=trivia&q=One&p=Joe:0');
		await open('g=trivia&q=Two&add=Joe:100');
		await page.reload();
		await expect(page.locator('.chip')).toHaveText(['Joe100']);
	});

	test('p= replaces the roster and reset=1 clears it', async ({ open, page }) => {
		await open('g=trivia&q=One&p=Joe:500');
		await open('g=trivia&q=Two&p=Kim:0');
		await expect(page.locator('.chip')).toHaveText(['Kim0']);
		await open('g=trivia&q=Three&reset=1');
		await expect(page.locator('.chip')).toHaveCount(0);
	});

	test('finished games appear in the hall of fame', async ({ open, page }) => {
		await open('g=trivia&st=end&p=Joe:300,Sam:500');
		await open('g=hall');
		await expect(page.getByRole('heading', { name: 'Recent winners' })).toBeVisible();
		await expect(page.locator('.score-row').first()).toContainText('Sam · Trivia');
	});

	test('empty hall of fame', async ({ open, page }) => {
		await open('g=hall');
		await expect(page.getByRole('heading', { name: 'No games yet' })).toBeVisible();
	});
});

test.describe('remembered state: resilience', () => {
	test('reloading the final screen records the game once', async ({ open, page }) => {
		await open('g=trivia&st=end&p=Joe:1');
		await page.reload();
		await open('g=hall');
		await expect(page.locator('.score-row')).toHaveCount(1);
	});

	test('corrupted storage is ignored', async ({ open, page }) => {
		await page.addInitScript(() => localStorage.setItem('voiceboard', '{not json'));
		await open('g=trivia&q=Still+works&p=Joe:5');
		await expect(page.locator('.chip')).toHaveText(['Joe5']);
	});

	test('the board works when storage is unavailable', async ({ open, page }) => {
		await page.addInitScript(() => {
			Object.defineProperty(window, 'localStorage', { get() { throw new Error('blocked'); } });
		});
		await open('g=trivia&q=No+storage&p=Joe:5');
		await expect(page.locator('h1')).toHaveText('No storage');
		await expect(page.locator('.chip')).toHaveText(['Joe5']);
	});
});
