import { test, expect } from './fixtures.js';

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
