import { test, expect } from '../../../tests/fixtures.js';

test.describe('effects', () => {
	test('timer counts down to zero and flags time up', async ({ open, page }) => {
		await page.clock.install();
		await open('g=trivia&q=Quick&timer=3');
		await expect(page.getByRole('timer')).toHaveText('3');
		await page.clock.runFor(1_100);
		await expect(page.getByRole('timer')).toHaveText('2');
		await page.clock.runFor(2_200);
		await expect(page.getByRole('timer')).toHaveText('0');
		await expect(page.getByRole('timer')).toHaveClass(/is-done/);
	});

	test('timer is capped at 10 minutes', async ({ open, page }) => {
		await open('g=trivia&q=Long&timer=99999');
		await expect(page.getByRole('timer')).toHaveText('600');
	});

	test('no timer param, no timer', async ({ open, page }) => {
		await open('g=trivia&q=Calm');
		await expect(page.getByRole('timer')).toHaveCount(0);
	});

	test('fx=confetti bursts over any screen', async ({ open, page }) => {
		await open('g=trivia&st=end&p=Joe:1&fx=confetti');
		await expect(page.locator('.fx-confetti i')).toHaveCount(90);
	});

	test('confetti respects reduced motion', async ({ open, page }) => {
		await page.emulateMedia({ reducedMotion: 'reduce' });
		await open('g=trivia&st=end&p=Joe:1&fx=confetti');
		await expect(page.locator('.fx-confetti')).toHaveCount(0);
	});
});

test.describe('effects: messy input', () => {
	test('fx is case-insensitive and accepts lists', async ({ open, page }) => {
		await open('g=trivia&st=end&p=Joe:1&fx=Sparkles,CONFETTI');
		await expect(page.locator('.fx-confetti')).toHaveCount(1);
	});

	test('a non-numeric or zero timer shows nothing', async ({ open, page }) => {
		await open('g=trivia&q=Hi&timer=soon');
		await expect(page.getByRole('timer')).toHaveCount(0);
		await open('g=trivia&q=Hi&timer=0');
		await expect(page.getByRole('timer')).toHaveCount(0);
	});
});

test.describe('auto-advance', () => {
	test('auto=reveal shows the answer when the timer ends', async ({ open, page }) => {
		await page.clock.install();
		await open('g=trivia&st=ask&q=Which+planet%3F&c=Mars|Saturn&a=B&timer=5&auto=reveal&p=Joe:0');
		await expect(page.locator('.fx-auto')).toHaveCount(1);
		await page.clock.runFor(5_100);
		await expect(page).toHaveURL(/st=reveal/);
		await expect(page.locator('.choice.is-correct')).toHaveText('BSaturn');
	});

	test('auto=next hands the turn to the next player and never repeats score changes', async ({ open, page }) => {
		await page.clock.install();
		await open('g=trivia&q=One&p=Joe:0,Sam:0');
		await open('g=trivia&st=reveal&q=One&c=A|B&a=A&r=Joe&add=Joe:100&up=Joe&auto=next&after=3');
		await page.clock.runFor(3_100);
		await expect(page).toHaveURL(/st=next&up=Sam|up=Sam.*st=next|st=next.*up=Sam/);
		await expect(page.locator('h1')).toHaveText('Sam');
		await expect(page.locator('.chip')).toHaveText(['Joe100', 'Sam0']);
		expect(page.url()).not.toContain('add=');
	});

	test('auto=score shows the scoreboard', async ({ open, page }) => {
		await page.clock.install();
		await open('g=trivia&st=reveal&q=One&c=A|B&a=A&p=Joe:5&auto=score&after=2');
		await page.clock.runFor(2_100);
		await expect(page.locator('h1')).toHaveText('Scoreboard');
	});
});
