import { test, expect } from './fixtures.js';

test.describe('languages', () => {
	test('lang=es translates the board labels and keeps content as sent', async ({ open, page }) => {
		await open({ g: 'trivia', st: 'reveal', lang: 'es', n: '2', of: '5', q: '¿Qué planeta tiene más lunas?', c: 'Júpiter|Saturno', a: 'B', r: 'Ana', p: 'Ana:1200' });
		await expect(page.locator('html')).toHaveAttribute('lang', 'es');
		await expect(page.locator('.bar')).toContainText('Pregunta 2 de 5');
		await expect(page.locator('.verdict')).toHaveText('¡Ana acertó!');
		await expect(page.locator('h1')).toHaveText('¿Qué planeta tiene más lunas?');
		await expect(page.locator('.chip')).toHaveText(['Ana1200']);
	});

	test('right-to-left languages flip the layout', async ({ open, page }) => {
		await open({ g: 'trivia', lang: 'ar', q: 'ما هو أكبر كوكب؟', c: 'المشتري|زحل' });
		await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
		const dock = await page.locator('#dock').boundingBox();
		expect(dock.x).toBeGreaterThan(1000);
		await open({ g: 'trivia', lang: 'he', q: 'שאלה' });
		await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
	});

	test('lang= applies to that URL only; the next page uses the browser language', async ({ open, page }) => {
		await open('g=home&lang=fr');
		await expect(page.locator('h1')).toHaveText('À quoi on joue ?');
		await open('g=home');
		await expect(page.locator('h1')).toHaveText('What should we play?');
	});

	test('regional tags and unknown languages resolve sensibly', async ({ open, page }) => {
		await open('g=home&lang=pt-BR');
		await expect(page.locator('html')).toHaveAttribute('lang', 'pt');
		await open('g=home&lang=xx');
		await expect(page.locator('html')).toHaveAttribute('lang', 'en');
	});

	test('without lang=, the browser language is used', async ({ browser, boardPath, baseURL }) => {
		const context = await browser.newContext({ locale: 'de-DE', baseURL });
		const page = await context.newPage();
		await page.goto(`${boardPath}?g=jeopardy&st=clue&cats=Raum|Flüsse&at=B3&q=Hinweis&dd=1`);
		await expect(page.locator('.eyebrow')).toHaveText('Doppelter Einsatz');
		await expect(page.locator('.bar')).toContainText('Flüsse · 600');
		await context.close();
	});

	for (const lang of ['ar', 'ja']) {
		test(`the home screen renders in ${lang} without errors`, async ({ open, page }) => {
			await open(`g=home&lang=${lang}`);
			await expect(page.locator('.tile')).toHaveCount(3);
		});
	}
});
