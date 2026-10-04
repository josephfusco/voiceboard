import { test, expect } from './fixtures.js';

const PARTY = 'ch=Joe:fighter:12/12,Sam:rogue:4/10&inv=Joe:sword|torch;Sam:lockpicks';

test.describe('adventure', () => {
	test('a scene shows the place, what is there, the exits, and the party', async ({ open, page }) => {
		await open(`g=adventure&${PARTY}&loc=The+Old+Mill&see=a+locked+chest|cobwebs&ex=door|ladder+up`);
		await expect(page.locator('h1')).toHaveText('The Old Mill');
		await expect(page.locator('.adv-exits .chip')).toHaveText(['door', 'ladder up']);
		await expect(page.locator('.adv-character')).toHaveCount(2);
		await expect(page.locator('.adv-character').nth(1)).toContainText('4/10');
		await expect(page.locator('.adv-item')).toHaveText(['sword', 'torch', 'lockpicks']);
	});

	test('the board rolls the dice, and reopening the same roll gives the same result', async ({ open, page }) => {
		const url = `g=adventure&${PARTY}&code=dice-test&roll=d20%2B3&for=Sam&vs=12&rn=1`;
		await open(url);
		const first = await page.locator('.adv-total').textContent();
		await expect(page.locator('.adv-verdict')).toHaveText(/Success!|Failed/);
		await expect(page.locator('.adv-character.is-up')).toContainText('Sam');
		await open(url);
		await expect(page.locator('.adv-total')).toHaveText(first);
		await open(url.replace('rn=1', 'rn=2'));
		await expect(page.locator('.adv-die')).toHaveCount(1);
	});

	test('dice totals add the bonus and respect the target', async ({ open, page }) => {
		await open(`g=adventure&${PARTY}&code=x&roll=d20%2B50&vs=10&rn=1`);
		await expect(page.locator('.adv-verdict')).toHaveText('Success!');
		await open(`g=adventure&${PARTY}&code=x&roll=d4&vs=99&rn=1`);
		await expect(page.locator('.adv-verdict')).toHaveText('Failed');
		await open(`g=adventure&${PARTY}&code=x&roll=3d6&rn=1`);
		await expect(page.locator('.adv-die')).toHaveCount(3);
	});
});

test('the transcript tells the assistant the roll result and the party', async ({ page, boardPath, request }) => {
	test.skip(boardPath === '/', 'needs the WordPress plugin');
	const code = `adv-${Date.now()}`;
	await Promise.all([
		page.waitForResponse((r) => r.url().includes('/voiceboard/v1/ping')),
		page.goto(`${boardPath}?g=adventure&code=${code}&${PARTY}&loc=The+Old+Mill&roll=d20%2B3&for=Sam&vs=12&rn=1`),
	]);
	const text = await (await request.get(`${boardPath}session/${code}`)).text();
	expect(text).toContain('Party: Joe (fighter, 12/12 HP, carrying sword, torch); Sam (rogue, 4/10 HP, carrying lockpicks).');
	expect(text).toMatch(/Sam rolled d20\+3: \d+\+3 = \d+ against 12, (success|failure)\./);
});
